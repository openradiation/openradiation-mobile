export class Measure {
  constructor(
    public id: string,
    public sensorUUID: string,
    public apparatusId: string,
    public apparatusVersion: string,
    public apparatusSensorType: string,
    public apparatusTubeType: string,
    public reportUUID: string,
    public deviceUUID: string,
    public devicePlatform: string,
    public deviceVersion: string,
    public deviceModel: string,
    public tsStart: number,
    public tsEnd: number,
    public duration: number,
    public temperature: number,
    public radiation: number,
    public longitude: string,
    public latitude: string,
    public accuracy: string,
    public altitude: string,
    public altitudeAccuracy: string,
    public environment: string,
    public position: number,
    public tags: string,
    public notes: string,
    public manualReporting = false,
    public sent = false
  ) {}
}

export enum PositionAccuracy {
  Good,
  Bad,
  Error
}

export const POSITION_ACCURACY_THRESHOLD = 30;
