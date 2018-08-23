import { Geoposition } from '@ionic-native/geolocation';

export class Measure {
  apparatusId?: string;
  apparatusVersion?: string;
  apparatusSensorType?: string;
  apparatusTubeType?: string;
  temperature: number;
  value: number;
  hitsNumber = 0;
  startTime: number;
  endTime: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number;
  altitudeAccuracy: number;
  endLatitude: number;
  endLongitude: number;
  endAccuracy: number;
  andAltitude: number;
  andAltitudeAccuracy: number;
  deviceUuid: string;
  devicePlatform: string;
  deviceVersion: string;
  deviceModel: string;
  reportUuid: string;
  manualReporting = false;
  organisationReporting: string;
  reportContext = 'routine';
  description: string;
  measurementHeight: number;
  tags: string[];
  enclosedObject: string;
  measurementEnvironment: string;
  rain: boolean;
  sent = false;
  steps?: Step[] = [];

  constructor(
    position: Geoposition,
    public sensorUUID: string | undefined,
    apparatusId: string | undefined,
    apparatusVersion: string | undefined,
    apparatusSensorType: string | undefined,
    apparatusTubeType: string | undefined,
    deviceUuid: string,
    devicePlatform: string,
    deviceVersion: string,
    deviceModel: string,
    reportUuid: string,
    manualReporting = false
  ) {
    this.apparatusId = apparatusId;
    this.apparatusVersion = apparatusVersion;
    this.apparatusSensorType = apparatusSensorType;
    this.apparatusTubeType = apparatusTubeType;
    this.apparatusVersion = apparatusVersion;
    this.longitude = position.coords.longitude;
    this.latitude = position.coords.latitude;
    this.accuracy = position.coords.accuracy;
    this.altitude = position.coords.altitude;
    this.altitudeAccuracy = position.coords.altitudeAccuracy;
    this.deviceUuid = deviceUuid;
    this.devicePlatform = devicePlatform;
    this.deviceVersion = deviceVersion;
    this.deviceModel = deviceModel;
    this.reportUuid = reportUuid;
    this.manualReporting = manualReporting;
  }
}

export interface Step {
  ts: number;
  hitsNumber: number;
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
