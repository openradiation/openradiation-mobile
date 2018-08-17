import { Geoposition } from '@ionic-native/geolocation';

export class Measure {
  sent = false;
  position: number;
  tsEnd: number;
  duration: number;
  temperature: number;
  radiation: number;
  environment: string;
  tags: string;
  notes: string;
  longitude: number;
  latitude: number;
  accuracy: number;
  altitude: number;
  altitudeAccuracy: number;

  constructor(
    position: Geoposition,
    public sensorUUID: string | undefined,
    public apparatusId: string | undefined,
    public apparatusVersion: string | undefined,
    public apparatusSensorType: string | undefined,
    public apparatusTubeType: string | undefined,
    public reportUUID: string,
    public deviceUUID: string,
    public devicePlatform: string,
    public deviceVersion: string,
    public deviceModel: string,
    public tsStart: number,
    public manualReporting = false
  ) {
    this.longitude = position.coords.longitude;
    this.latitude = position.coords.latitude;
    this.accuracy = position.coords.accuracy;
    this.altitude = position.coords.altitude;
    this.altitudeAccuracy = position.coords.altitudeAccuracy;
  }
}

export enum PositionAccuracy {
  Good,
  Bad,
  Error
}

export const POSITION_ACCURACY_THRESHOLD = 30;
