var UsbSerial = {
    onDeviceAttached: function(whiteList, successCallback) {
        cordova.exec(
          successCallback,
          () => {},
          'UsbSerial',
          'onDeviceAttached',
          [{'whiteList': whiteList}]
        )
    }
};
module.exports = UsbSerial;
