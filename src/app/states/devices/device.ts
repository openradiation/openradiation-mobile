export class Device {
  constructor(
    public sensorUUID: string,
    public apparatusId: string,
    public apparatusVersion: string,
    public apparatusSensorType?: string,
    public apparatusTubeType?: string,
    public paramAudioHits = true,
    public paramVisualHits = true
  ) {}
}

export interface DeviceStatus {
  device: Device;
  isConnected: boolean;
}

export interface RawDevice {
  name: string;
  id: string;
  advertising: any;
  rssi: number;
}
