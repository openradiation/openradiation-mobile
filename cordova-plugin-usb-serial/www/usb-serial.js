var UsbSerial = {
    onDeviceAttached: function(whiteList, successCallback) {
        cordova.exec(
          successCallback,
          () => {},
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
    }
};
module.exports = UsbSerial;
