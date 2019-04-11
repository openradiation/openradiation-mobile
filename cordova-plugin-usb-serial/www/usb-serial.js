var UsbSerial = {
    onDeviceAttached: function(whiteList, successCallback) {
        cordova.exec(
          successCallback,
          () => {},
          'UsbSerial',
          'onDeviceAttached',
          [{'whiteList': whiteList, 'cancelCallback': successCallback === null}]
        )
    }
};
module.exports = UsbSerial;
