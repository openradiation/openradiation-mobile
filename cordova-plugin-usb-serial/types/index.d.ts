interface Device {
  vid: string;
  pid: string;
}

interface ConnectionConfig {
  baudRate: number;
  dataBits: number;
}

export interface UsbSerial {
  onDeviceAttached: (whiteList: Device[], successCallback: ((devicesAttached: Device[]) => void) | null) => void;
  connect: (
    device: Device,
    connectionConfig: ConnectionConfig,
    successCallback: (status: string) => void,
    errorCallback: (err: any) => void
  ) => void;
}
