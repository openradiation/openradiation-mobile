export class Device {
  public id: number;

  constructor(
    public sensorUUID: string,
    public apparatusId: string,
    public apparatusVersion: string,
    public apparatusSensorType: string,
    public apparatusTubeType: string,
    public paramAudioHits = true,
    public paramVisualHits = true
  ) {}
}

export interface DeviceStatus {
  device: Device;
  isConnected: boolean;
}
