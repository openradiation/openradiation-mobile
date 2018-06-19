export class Device {
  public id: number;
  public connected = false;

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
