interface Device {
  vid: string;
  pid: string;
}

export interface UsbSerial {
  onDeviceAttached: (whiteList: Device[], successCallback: ((devicesAttached: Device[]) => void) | null) => void;
}
