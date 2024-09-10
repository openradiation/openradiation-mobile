package org.irsn.cordova.usbSerial;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;
import android.util.Base64;
import android.util.Log;
import android.os.Build;

import com.felhr.usbserial.UsbSerialDevice;
import com.felhr.usbserial.UsbSerialInterface;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Cordova plugin to communicate with the android serial port
 */
public class UsbSerial extends CordovaPlugin {
    // logging TAG
    private final String TAG = UsbSerial.class.getSimpleName();
    // actions definitions
    private static final String ACTION_ON_DEVICE_ATTACHED = "onDeviceAttached";
    private static final String ACTION_CONNECT = "connect";
    private static final String ACTION_DISCONNECT = "disconnect";
    private static final String ACTION_ON_DATA_RECEIVED = "onDataReceived";
    private static final String ACTION_WRITE = "write";

    private static final String ACTION_USB_ATTACHED = "android.hardware.usb.action.USB_DEVICE_ATTACHED";
    private static final String ACTION_USB_DETACHED = "android.hardware.usb.action.USB_DEVICE_DETACHED";
    private static final String ACTION_USB_PERMISSION = "irsn.usb.USB_PERMISSION";

    private UsbManager usbManager;

    private CallbackContext readCallback;

    private CallbackContext deviceAttachedCallback;
    private JSONArray deviceWhiteList;

    private CallbackContext connectCallback;
    private JSONObject connectionConfig;
    private UsbDevice device;
    private UsbSerialDevice serialPort;

    /**
     * Overridden execute method
     *
     * @param action          the string representation of the action to execute
     * @param callbackContext the cordova {@link CallbackContext}
     * @return true if the action exists, false otherwise
     * @throws JSONException if the args parsing fails
     */
    @Override
    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
        JSONObject arg_object = args.optJSONObject(0);
        Log.d(TAG, "Execute action: " + action);
        switch (action) {
            case ACTION_ON_DEVICE_ATTACHED:
                JSONArray whiteList = arg_object.has("whiteList") ? arg_object.getJSONArray("whiteList") : null;
                boolean cancelCallback = arg_object.getBoolean("cancelCallback");
                onDeviceAttached(whiteList, cancelCallback ? null : callbackContext);
                return true;
            case ACTION_CONNECT:
                JSONObject device = arg_object.has("device") ? arg_object.getJSONObject("device") : null;
                JSONObject connectionConfig = arg_object.has("connectionConfig")
                        ? arg_object.getJSONObject("connectionConfig")
                        : null;
                Log.d(TAG, "IRSN-usb ACTION_CONNECT: " + device + "/" + connectionConfig);
                requestPermission(device, connectionConfig, callbackContext);
                return true;
            case ACTION_DISCONNECT:
                disconnect(callbackContext);
                return true;
            case ACTION_ON_DATA_RECEIVED:
                onDataReceived(callbackContext);
                return true;
            case ACTION_WRITE:
                String data = arg_object.has("data") ? arg_object.getString("data") : null;
                write(data);
                return true;
            default:
                Log.e(TAG, "Unhandled execute action : " + action);
                return false;
        }
    }

    private final BroadcastReceiver usbReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (action != null) {
                switch (action) {
                    case ACTION_USB_ATTACHED:
                        Log.d(TAG, "Received broadcast - USB attached");
                        listDevicesAttached();

                        break;
                    case ACTION_USB_DETACHED:
                        Log.d(TAG, "Received broadcast - USB detached");
                        listDevicesAttached();
                        if (connectCallback != null) {
                            connectCallback.error("usb detached");
                            connectCallback = null;
                        }
                        break;
                    case ACTION_USB_PERMISSION:
                        boolean granted = intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false);
                        Log.d(TAG, "\"Received broadcast - USB Permission (granted : " + granted +")");
                        if (granted) {
                            connect();
                        } else {
                            connectionCallbackError("permission refused");
                        }
                        break;
                    default:
                        Log.e(TAG, "Received unhandled broadcast action : " + action);
                        break;
                }
            }
        }
    };

    /**
     * Register a callback that will be called when a usb device is attached to the
     * phone
     * A whitelist can be provided to filter which devices will trigger the callback
     */
    private void onDeviceAttached(final JSONArray whiteList, final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
            deviceWhiteList = whiteList;
            deviceAttachedCallback = callbackContext;
            listDevicesAttached();
        });
    }

    private void listDevicesAttached() {
        cordova.getThreadPool().execute(() -> {
            if (deviceAttachedCallback != null && deviceWhiteList != null) {
                HashMap<String, UsbDevice> usbDevices = usbManager.getDeviceList();
                JSONArray devicesAttached = new JSONArray();
                for (Map.Entry<String, UsbDevice> entry : usbDevices.entrySet()) {
                    UsbDevice device = entry.getValue();
                    int deviceVID = device.getVendorId();
                    int devicePID = device.getProductId();
                    if (deviceWhiteList.length() == 0) {
                        LinkedHashMap<String, Integer> deviceAttached = new LinkedHashMap<>();
                        deviceAttached.put("pid", devicePID);
                        deviceAttached.put("vid", deviceVID);
                        devicesAttached.put(new JSONObject(deviceAttached));
                        break;
                    } else {
                        for (int i = 0; i < deviceWhiteList.length(); i++) {
                            try {
                                JSONObject authorizedDevice = deviceWhiteList.getJSONObject(i);
                                Object o_vid = authorizedDevice.opt("vid"); // can be an integer Number or a hex String
                                Object o_pid = authorizedDevice.opt("pid"); // can be an integer Number or a hex String
                                int vid = o_vid instanceof Number ? ((Number) o_vid).intValue()
                                        : Integer.parseInt((String) o_vid, 16);
                                int pid = o_pid instanceof Number ? ((Number) o_pid).intValue()
                                        : Integer.parseInt((String) o_pid, 16);
                                if (deviceVID == vid && devicePID == pid) {
                                    LinkedHashMap<String, Object> deviceAttached = new LinkedHashMap<>();
                                    deviceAttached.put("pid", o_pid);
                                    deviceAttached.put("vid", o_vid);
                                    devicesAttached.put(new JSONObject(deviceAttached));
                                    break;
                                }
                            } catch (JSONException e) {
                                deviceAttachedCallbackError("invalid parameters");
                            }
                        }
                    }

                }
                PluginResult result = new PluginResult(PluginResult.Status.OK, devicesAttached);
                result.setKeepCallback(true);
                deviceAttachedCallback.sendPluginResult(result);
            }
        });
    }

    private void deviceAttachedCallbackError(String error) {
        cordova.getThreadPool().execute(() -> {
            if (deviceAttachedCallback != null) {
                deviceAttachedCallback.error(error);
            }
            deviceAttachedCallback = null;
            deviceWhiteList = null;
        });
    }

    private void requestPermission(final JSONObject device, final JSONObject connectionConfig,
            final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
            connectCallback = callbackContext;
            this.connectionConfig = connectionConfig;
            Object o_vid = device.opt("vid"); // can be an integer Number or a hex String
            Object o_pid = device.opt("pid"); // can be an integer Number or a hex String
            int vid = o_vid instanceof Number ? ((Number) o_vid).intValue() : Integer.parseInt((String) o_vid, 16);
            int pid = o_pid instanceof Number ? ((Number) o_pid).intValue() : Integer.parseInt((String) o_pid, 16);
            this.device = null;
            HashMap<String, UsbDevice> usbDevices = usbManager.getDeviceList();
            for (Map.Entry<String, UsbDevice> entry : usbDevices.entrySet()) {
                UsbDevice attachedDevice = entry.getValue();
                if (attachedDevice.getVendorId() == vid && attachedDevice.getProductId() == pid) {
                    this.device = attachedDevice;
                    break;
                }
            }
            if (this.device == null) {
                connectionCallbackError("device not found");
            } else {
                Log.d(TAG, "Request permission for devices " + this.device);
                boolean hasRequiredUSBHostFeature = cordova.getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_USB_HOST);
                if (hasRequiredUSBHostFeature) {
                    Intent permissionGrantIntent = new Intent(ACTION_USB_PERMISSION);
                    permissionGrantIntent.setPackage(cordova.getContext().getPackageName());
                    PendingIntent mPendingIntent = PendingIntent.getBroadcast(cordova.getContext(), 0, permissionGrantIntent, PendingIntent.FLAG_MUTABLE);
                    usbManager.requestPermission(this.device, mPendingIntent);
                } else {
                    connectionCallbackError("missing usb host system feature");
                }
            }
        });
    }

    private void connect() {
        cordova.getThreadPool().execute(() -> {
            Log.d(TAG, "Connecting to device : " + device + "/ Connection Configuration : " + connectionConfig);
            if (device != null && connectionConfig != null) {
                try {
                    int baudRate = connectionConfig.getInt("baudRate");
                    int dataBits = connectionConfig.getInt("dataBits");

                    UsbDeviceConnection usbConnection = usbManager.openDevice(device);
                    serialPort = UsbSerialDevice.createUsbSerialDevice(device, usbConnection);
                    serialPort.open();
                    serialPort.setBaudRate(baudRate);
                    serialPort.setDataBits(dataBits);
                    serialPort.setStopBits(UsbSerialInterface.STOP_BITS_1);
                    serialPort.setParity(UsbSerialInterface.PARITY_NONE);
                    Log.d(TAG, "IRSN usb - Serial Port opened");
                    serialPort.read(this::updateReceivedData);
                    PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, "connected");
                    pluginResult.setKeepCallback(true);
                    connectCallback.sendPluginResult(pluginResult);
                } catch (JSONException e) {
                    Log.e(TAG, "IRSN usb " + e.getMessage(), e);
                    connectionCallbackError("invalid parameters");
                }
            }
        });
    }

    private void connectionCallbackError(String error) {
        Log.e(TAG, "Error : " + error);
        cordova.getThreadPool().execute(() -> {
            if (connectCallback != null) {
                connectCallback.error(error);
            }
            connectCallback = null;
            connectionConfig = null;
            device = null;
            if (serialPort != null && serialPort.isOpen()) {
                serialPort.close();
            }
            serialPort = null;
            readCallback = null;
        });
    }

    private void disconnect(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
            if (connectCallback != null) {
                connectCallback.success("disconnected");
            }
            connectCallback = null;
            connectionConfig = null;
            device = null;
            if (serialPort != null && serialPort.isOpen()) {
                serialPort.close();
            }
            serialPort = null;
            callbackContext.success("device disconnected");
            readCallback = null;
        });
    }

    /**
     * Dispatch read data to javascript
     *
     * @param data the array of bytes to dispatch
     */
    private void updateReceivedData(byte[] data) {
        Log.d(TAG, "IRSN usb - updateReceivedData..." + readCallback);
        cordova.getThreadPool().execute(() -> {
            if (readCallback != null) {
                Log.d(TAG, "IRSN usb - plugin result : ok...");
                PluginResult result = new PluginResult(PluginResult.Status.OK, data);
                result.setKeepCallback(true);
                readCallback.sendPluginResult(result);
            }
        });
    }

    /**
     * Register callback for read data
     *
     * @param callbackContext the cordova {@link CallbackContext}
     */
    private void onDataReceived(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
            readCallback = callbackContext;
        });
    }

    private void write(String data) {
        cordova.getThreadPool().execute(() -> {
            if (serialPort != null) {
                byte[] buffer = data.getBytes();
                serialPort.write(buffer);
            }
        });
    }

    @Override
    public void pluginInitialize() {
        // Register the usbReceiver as listening for usb attached/detached and permission
        IntentFilter filter = new IntentFilter();
        filter.addAction(ACTION_USB_DETACHED);
        filter.addAction(ACTION_USB_ATTACHED);
        filter.addAction(ACTION_USB_PERMISSION);

        // Additional parameters required since Android 34
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            cordova.getContext().registerReceiver(usbReceiver, filter, Context.RECEIVER_EXPORTED);
        } else {
            cordova.getContext().registerReceiver(usbReceiver, filter);
        }
        usbManager = (UsbManager) cordova.getContext().getSystemService(Context.USB_SERVICE);
    }

    /**
     * Paused activity handler
     *
     * @see org.apache.cordova.CordovaPlugin#onPause(boolean)
     */
    @Override
    public void onPause(boolean multitasking) {
    }

    /**
     * Resumed activity handler
     *
     * @see org.apache.cordova.CordovaPlugin#onResume(boolean)
     */
    @Override
    public void onResume(boolean multitasking) {
    }

    /**
     * Destroy activity handler
     *
     * @see org.apache.cordova.CordovaPlugin#onDestroy()
     */
    @Override
    public void onDestroy() {
    }

}
