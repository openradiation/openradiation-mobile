var UsbSerial = {
    onDeviceAttached: function(whiteList, successCallback) {
        cordova.exec(
          successCallback,
          null,
          'UsbSerial',
          'onDeviceAttached',
          [{whiteList, cancelCallback: successCallback === null}]
        )
    },
    connect: function(device, connectionConfig, successCallback, errorCallback) {
        cordova.exec(
          successCallback,
          errorCallback,
          'UsbSerial',
          'connect',
          [{device, connectionConfig}]
        )
    },
    disconnect: function(successCallback, errorCallback) {
        cordova.exec(
          successCallback,
          errorCallback,
          'UsbSerial',
          'disconnect'
        )
    },
    onDataReceived: function(successCallback, errorCallback) {
        cordova.exec(
          successCallback,
          errorCallback,
          'UsbSerial',
          'onDataReceived'
        )
    },
    write: function(data) {
        cordova.exec(
          null,
          null,
          'UsbSerial',
          'write',
          [{data}]
        )
    }
};
module.exports = UsbSerial;
