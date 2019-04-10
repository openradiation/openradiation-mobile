package org.irsn.cordova.usbSerial;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

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


/**
 * Cordova plugin to communicate with the android serial port
 */
public class UsbSerial extends CordovaPlugin {
    // logging tag
    private final String TAG = UsbSerial.class.getSimpleName();
    // actions definitions
    private static final String ACTION_REQUEST_PERMISSION = "requestPermission";
    private static final String ACTION_OPEN = "openSerial";
    private static final String ACTION_READ = "readSerial";
    private static final String ACTION_WRITE = "writeSerial";
    private static final String ACTION_WRITE_HEX = "writeSerialHex";
    private static final String ACTION_CLOSE = "closeSerial";
    private static final String ACTION_READ_CALLBACK = "registerReadCallback";

    private static final String ACTION_USB_ATTACHED = "android.hardware.usb.action.USB_DEVICE_ATTACHED";
    private static final String ACTION_USB_DETACHED = "android.hardware.usb.action.USB_DEVICE_DETACHED";

    private boolean serialPortConnected;

    // callback that will be used to send back data to the cordova app
    private CallbackContext readCallback;

    /**
     * Overridden execute method
     * @param action the string representation of the action to execute
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
        if (ACTION_REQUEST_PERMISSION.equals(action)) {
            JSONObject opts = arg_object.has("opts")? arg_object.getJSONObject("opts") : new JSONObject();
            requestPermission(opts, callbackContext);
            return true;
        }
        // open serial port
        else if (ACTION_OPEN.equals(action)) {
            JSONObject opts = arg_object.has("opts")? arg_object.getJSONObject("opts") : new JSONObject();
            openSerial(opts, callbackContext);
            return true;
        }
        // write to the serial port
        else if (ACTION_WRITE.equals(action)) {
            String data = arg_object.getString("data");
            writeSerial(data, callbackContext);
            return true;
        }
        // write hex to the serial port
        else if (ACTION_WRITE_HEX.equals(action)) {
            String data = arg_object.getString("data");
            writeSerialHex(data, callbackContext);
            return true;
        }
        // read on the serial port
        else if (ACTION_READ.equals(action)) {
            readSerial(callbackContext);
            return true;
        }
        // close the serial port
        else if (ACTION_CLOSE.equals(action)) {
            closeSerial(callbackContext);
            return true;
        }
        // Register read callback
        else if (ACTION_READ_CALLBACK.equals(action)) {
            registerReadCallback(callbackContext);
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
                    if (!serialPortConnected) {
                    }
                    break;
                case ACTION_USB_DETACHED:
                    Log.d(TAG, "usb dettached");
                    if (serialPortConnected) {
                    }
                    serialPortConnected = false;
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
     * Request permission the the user for the app to use the USB/serial port
     * @param callbackContext the cordova {@link CallbackContext}
     */
    private void requestPermission(final JSONObject opts, final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
        });
    }

    /**
     * Open the serial port from Cordova
     * @param opts a {@link JSONObject} containing the connection paramters
     * @param callbackContext the cordova {@link CallbackContext}
     */
    private void openSerial(final JSONObject opts, final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
        });
    }

    /**
     * Write on the serial port
     * @param data the {@link String} representation of the data to be written on the port
     * @param callbackContext the cordova {@link CallbackContext}
     */
    private void writeSerial(final String data, final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
        });
    }

    /**
     * Write hex on the serial port
     * @param data the {@link String} representation of the data to be written on the port as hexadecimal string
     *             e.g. "ff55aaeeef000233"
     * @param callbackContext the cordova {@link CallbackContext}
     */
    private void writeSerialHex(final String data, final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
        });
    }

    /**
     * Convert a given string of hexadecimal numbers
     * into a byte[] array where every 2 hex chars get packed into
     * a single byte.
     *
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
                    + Character.digit(s.charAt(i+1), 16));
        }
        return data;
    }

    /**
     * Read on the serial port
     * @param callbackContext the {@link CallbackContext}
     */
    private void readSerial(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
        });
    }

    /**
     * Close the serial port
     * @param callbackContext the cordova {@link CallbackContext}
     */
    private void closeSerial(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
        });
    }

    /**
     * Dispatch read data to javascript
     * @param data the array of bytes to dispatch
     */
    private void updateReceivedData(byte[] data) {
        if( readCallback != null ) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, data);
            result.setKeepCallback(true);
            readCallback.sendPluginResult(result);
        }
    }

    /**
     * Register callback for read data
     * @param callbackContext the cordova {@link CallbackContext}
     */
    private void registerReadCallback(final CallbackContext callbackContext) {
        Log.d(TAG, "Registering callback");
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
        serialPortConnected = false;
        setFilter();
    }

    /**
     * Paused activity handler
     * @see org.apache.cordova.CordovaPlugin#onPause(boolean)
     */
    @Override
    public void onPause(boolean multitasking) {
    }


    /**
     * Resumed activity handler
     * @see org.apache.cordova.CordovaPlugin#onResume(boolean)
     */
    @Override
    public void onResume(boolean multitasking) {
    }


    /**
     * Destroy activity handler
     * @see org.apache.cordova.CordovaPlugin#onDestroy()
     */
    @Override
    public void onDestroy() {
    }

    /**
     * Utility method to add some properties to a {@link JSONObject}
     * @param obj the json object where to add the new property
     * @param key property key
     * @param value value of the property
     */
    private void addProperty(JSONObject obj, String key, Object value) {
        try {
            obj.put(key, value);
        }
        catch (JSONException e){}
    }

    /**
     * Utility method to add some properties to a {@link JSONObject}
     * @param obj the json object where to add the new property
     * @param key property key
     * @param bytes the array of byte to add as value to the {@link JSONObject}
     */
    private void addPropertyBytes(JSONObject obj, String key, byte[] bytes) {
        String string = Base64.encodeToString(bytes, Base64.NO_WRAP);
        this.addProperty(obj, key, string);
    }
}