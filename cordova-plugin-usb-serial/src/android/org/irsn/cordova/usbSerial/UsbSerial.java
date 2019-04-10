package org.irsn.cordova.usbSerial;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.util.Base64;
import android.util.Log;

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

    private static final String ACTION_USB_ATTACHED = "android.hardware.usb.action.USB_DEVICE_ATTACHED";
    private static final String ACTION_USB_DETACHED = "android.hardware.usb.action.USB_DEVICE_DETACHED";

    private UsbManager usbManager;

    private CallbackContext readCallback;
    private CallbackContext deviceAttachedCallback;
    private JSONArray deviceWhiteList;

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
        // request permission
        if (ACTION_ON_DEVICE_ATTACHED.equals(action)) {
            JSONArray whiteList = arg_object.has("whiteList") ? arg_object.getJSONArray("whiteList") : null;
            onDeviceAttached(whiteList, callbackContext);
            return true;
        }
        // the action doesn't exist
        return false;
    }

    private final BroadcastReceiver usbReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            switch (intent.getAction()) {
                case ACTION_USB_ATTACHED:
                    Log.d(TAG, "usb attached");
                    findDevice();
                    break;
                case ACTION_USB_DETACHED:
                    Log.d(TAG, "usb dettached");
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
            findDevice();
        });
    }

    private void findDevice() {
        if (deviceAttachedCallback != null) {
            HashMap<String, UsbDevice> usbDevices = usbManager.getDeviceList();

            for (Map.Entry<String, UsbDevice> entry : usbDevices.entrySet()) {
                UsbDevice device = entry.getValue();
                int deviceVID = device.getVendorId();
                int devicePID = device.getProductId();
                if (deviceWhiteList == null) {
                    LinkedHashMap<String, Integer> deviceAttached = new LinkedHashMap<>();
                    deviceAttached.put("pid", devicePID);
                    deviceAttached.put("vid", deviceVID);
                    deviceAttachedCallback.sendPluginResult(new PluginResult(PluginResult.Status.OK, new JSONObject(deviceAttached)));
                    break;
                } else {
                    for (int i = 0; i < deviceWhiteList.length(); i++) {
                        try {
                            JSONObject authorizedDevice = deviceWhiteList.getJSONObject(i);
                            Object o_vid = authorizedDevice.opt("vid"); //can be an integer Number or a hex String
                            Object o_pid = authorizedDevice.opt("pid"); //can be an integer Number or a hex String
                            int vid = o_vid instanceof Number ? ((Number) o_vid).intValue() : Integer.parseInt((String) o_vid,16);
                            int pid = o_pid instanceof Number ? ((Number) o_pid).intValue() : Integer.parseInt((String) o_pid,16);
                            if(deviceVID == vid && devicePID == pid) {
                                LinkedHashMap<String, Object> deviceAttached = new LinkedHashMap<>();
                                deviceAttached.put("pid", o_pid);
                                deviceAttached.put("vid", o_vid);
                                deviceAttachedCallback.sendPluginResult(new PluginResult(PluginResult.Status.OK, new JSONObject(deviceAttached)));
                                break;
                            }
                        } catch (JSONException e) {
                        }
                    }
                }

            }
        }
    }

    /**
     * Convert a given string of hexadecimal numbers
     * into a byte[] array where every 2 hex chars get packed into
     * a single byte.
     * <p>
     * E.g. "ffaa55" results in a 3 byte long byte array
     *
     * @param s
     * @return
     */
    private byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                    + Character.digit(s.charAt(i + 1), 16));
        }
        return data;
    }

    /**
     * Read on the serial port
     *
     * @param callbackContext the {@link CallbackContext}
     */
    private void readSerial(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
        });
    }

    /**
     * Close the serial port
     *
     * @param callbackContext the cordova {@link CallbackContext}
     */
    private void closeSerial(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
        });
    }

    /**
     * Dispatch read data to javascript
     *
     * @param data the array of bytes to dispatch
     */
    private void updateReceivedData(byte[] data) {
        if (readCallback != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, data);
            result.setKeepCallback(true);
            readCallback.sendPluginResult(result);
        }
    }

    /**
     * Register callback for read data
     *
     * @param callbackContext the cordova {@link CallbackContext}
     */
    private void registerReadCallback(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
            Log.d(TAG, "Registering Read Callback");
            readCallback = callbackContext;
            JSONObject returnObj = new JSONObject();
            addProperty(returnObj, "registerReadCallback", "true");
            // Keep the callback
            PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, returnObj);
            pluginResult.setKeepCallback(true);
            callbackContext.sendPluginResult(pluginResult);
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

    /**
     * Utility method to add some properties to a {@link JSONObject}
     *
     * @param obj   the json object where to add the new property
     * @param key   property key
     * @param value value of the property
     */
    private void addProperty(JSONObject obj, String key, Object value) {
        try {
            obj.put(key, value);
        } catch (JSONException e) {
        }
    }

    /**
     * Utility method to add some properties to a {@link JSONObject}
     *
     * @param obj   the json object where to add the new property
     * @param key   property key
     * @param bytes the array of byte to add as value to the {@link JSONObject}
     */
    private void addPropertyBytes(JSONObject obj, String key, byte[] bytes) {
        String string = Base64.encodeToString(bytes, Base64.NO_WRAP);
        this.addProperty(obj, key, string);
    }
}