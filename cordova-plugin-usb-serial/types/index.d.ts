interface Device {
  vid: string;
  pid: string;
}

export interface UsbSerial {
  onDeviceAttached: (whiteList: Device[], successCallback: (deviceConnected: Device) => void) => void;
}
