import { Geoposition } from '@ionic-native/geolocation';

export class Measure {
  sent = false;
  position: number;
  tsEnd: number;
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
  hits = 0;
  steps?: Step[] = [];

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
    this.tsEnd = this.tsStart + 1;
  }
}

export interface Step {
  ts: number;
  hits: number;
  voltage: number;
  temperature: number;
}

export enum PositionAccuracy {
  Good,
  Bad,
  Error
}

export enum HitsAccuracy {
  start = 'start',
  bad = 'bad',
  medium = 'medium',
  good = 'good',
  accurate = 'accurate'
}

export enum HitsAccuracyThreshold {
  start = 0,
  bad = 3,
  medium = 10,
  good = 25,
  accurate = 50
}

export const POSITION_ACCURACY_THRESHOLD = 30;
