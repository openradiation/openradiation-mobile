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
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;
import android.util.Base64;
import android.util.Log;

import com.felhr.usbserial.UsbSerialDevice;
import com.felhr.usbserial.UsbSerialInterface;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;


/**
 * Cordova plugin to communicate with the android serial port
 */
public class UsbSerial extends CordovaPlugin {
    // logging tag
    private final String TAG = UsbSerial.class.getSimpleName();
    // actions definitions
    private static final String ACTION_ON_DEVICE_ATTACHED = "onDeviceAttached";
    private static final String ACTION_CONNECT = "connect";
    private static final String ACTION_DISCONNECT = "disconnect";
    private static final String ACTION_ON_DATA_RECEIVED = "onDataReceived";
    private static final String ACTION_WRITE = "write";

    private static final String ACTION_USB_ATTACHED = "android.hardware.usb.action.USB_DEVICE_ATTACHED";
    private static final String ACTION_USB_DETACHED = "android.hardware.usb.action.USB_DEVICE_DETACHED";
    private static final String ACTION_USB_PERMISSION = "com.android.example.USB_PERMISSION";

    private UsbManager usbManager;

    private CallbackContext readCallback;

    private CallbackContext deviceAttachedCallback;
    private JSONArray deviceWhiteList;

    private CallbackContext connectCallback;
    private JSONObject connectionConfig;
    private UsbDevice device;
    private UsbSerialDevice serialPort;

    private UsbSerialInterface.UsbReadCallback mCallback = new UsbSerialInterface.UsbReadCallback() {

        @Override
        public void onReceivedData(byte[] arg0) {
            updateReceivedData(arg0);
        }

    };

    /**
     * Overridden execute method
     *
     * @param action          the string representation of the action to execute
     * @param args
     * @param callbackContext the cordova {@link CallbackContext}
     * @return true if the action exists, false otherwise
     * @throws JSONException if the args parsing fails
     */
    @Override
    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, "Action: " + action);
        JSONObject arg_object = args.optJSONObject(0);
        switch (action) {
            case ACTION_ON_DEVICE_ATTACHED:
                JSONArray whiteList = arg_object.has("whiteList") ? arg_object.getJSONArray("whiteList") : null;
                boolean cancelCallback = arg_object.getBoolean("cancelCallback");
                onDeviceAttached(whiteList, cancelCallback ? null : callbackContext);
                return true;
            case ACTION_CONNECT:
                JSONObject device = arg_object.has("device") ? arg_object.getJSONObject("device") : null;
                JSONObject connectionConfig = arg_object.has("connectionConfig") ? arg_object.getJSONObject("connectionConfig") : null;
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
                return false;
        }
    }

    private final BroadcastReceiver usbReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            switch (intent.getAction()) {
                case ACTION_USB_ATTACHED:
                    Log.d(TAG, "usb attached");
                    listDevicesAttached();
                    break;
                case ACTION_USB_DETACHED:
                    Log.d(TAG, "usb detached");
                    listDevicesAttached();
                    if (connectCallback != null) {
                        connectCallback.error("usb detached");
                        connectCallback = null;
                    }
                    break;
                case ACTION_USB_PERMISSION:
                    Log.d(TAG, "usb permission");
                    boolean granted = intent.getExtras().getBoolean(UsbManager.EXTRA_PERMISSION_GRANTED);
                    if (granted) {
                        connect();
                    } else {
                        connectionCallbackError("permission refused");
                    }
                    break;
                default:
                    Log.e(TAG, "Unknown action");
                    break;
            }
        }
    };

    private void setFilter() {
        IntentFilter filter = new IntentFilter();
        filter.addAction(ACTION_USB_DETACHED);
        filter.addAction(ACTION_USB_ATTACHED);
        filter.addAction(ACTION_USB_PERMISSION);
        cordova.getContext().registerReceiver(usbReceiver, filter);
    }

    /**
     * Register a callback that will be called when a usb device is attached to the phone
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
                                Object o_vid = authorizedDevice.opt("vid"); //can be an integer Number or a hex String
                                Object o_pid = authorizedDevice.opt("pid"); //can be an integer Number or a hex String
                                int vid = o_vid instanceof Number ? ((Number) o_vid).intValue() : Integer.parseInt((String) o_vid, 16);
                                int pid = o_pid instanceof Number ? ((Number) o_pid).intValue() : Integer.parseInt((String) o_pid, 16);
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

    private void requestPermission(final JSONObject device, final JSONObject connectionConfig, final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
            connectCallback = callbackContext;
            this.connectionConfig = connectionConfig;
            Object o_vid = device.opt("vid"); //can be an integer Number or a hex String
            Object o_pid = device.opt("pid"); //can be an integer Number or a hex String
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
                PendingIntent mPendingIntent = PendingIntent.getBroadcast(cordova.getContext(), 0, new Intent(ACTION_USB_PERMISSION), 0);
                usbManager.requestPermission(this.device, mPendingIntent);
            }
        });
    }

    private void connect() {
        cordova.getThreadPool().execute(() -> {
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
                    serialPort.read(mCallback);
                    PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, "connected");
                    pluginResult.setKeepCallback(true);
                    connectCallback.sendPluginResult(pluginResult);
                } catch (JSONException e) {
                    connectionCallbackError("invalid parameters");
                }
            }
        });
    }

    private void connectionCallbackError(String error) {
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
        cordova.getThreadPool().execute(() -> {
            if (readCallback != null) {
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
        setFilter();
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
