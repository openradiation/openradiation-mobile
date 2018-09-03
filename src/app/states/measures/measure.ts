import { environment } from '../../../environments/environment';

export class Measure {
  apparatusId?: string;
  apparatusVersion?: string;
  apparatusSensorType?: string;
  apparatusTubeType?: string;
  temperature?: number;
  value: number;
  hitsNumber = 0;
  startTime: number;
  endTime?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  endLatitude: number;
  endLongitude: number;
  endAccuracy?: number;
  endAltitude?: number;
  endAltitudeAccuracy?: number;
  deviceUuid?: string;
  devicePlatform?: string;
  deviceVersion?: string;
  deviceModel?: string;
  reportUuid: string;
  manualReporting = false;
  organisationReporting?: string;
  description?: string;
  measurementHeight?: number;
  tags?: string[];
  enclosedObject?: string;
  measurementEnvironment?: MeasureEnvironment;
  rain?: boolean;
  sent = false;
  steps?: Step[] = [];

  constructor(
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
    this.deviceUuid = deviceUuid;
    this.devicePlatform = devicePlatform;
    this.deviceVersion = deviceVersion;
    this.deviceModel = deviceModel;
    this.reportUuid = reportUuid;
    this.manualReporting = manualReporting;
    this.organisationReporting = environment.APP_NAME_VERSION;
  }
}

export interface Step {
  ts: number;
  hitsNumber: number;
  voltage: number;
  temperature: number;
}

export enum PositionAccuracyThreshold {
  Good = 30,
  Bad = Infinity,
  Error = -1
}

export enum PositionAccuracy {
  Good = 'good',
  Bad = 'bad',
  Error = 'error'
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

export enum MeasureEnvironment {
  Countryside = 'countryside',
  City = 'city',
  Ontheroad = 'ontheroad',
  Inside = 'inside',
  Plane = 'plane'
}

export interface MeasureReport {
  latitude: number | undefined;
  longitude: number | undefined;
  endLatitude: number | undefined;
  endLongitude: number | undefined;
  date: string | undefined;
  startTime: string | undefined;
  duration: string | undefined;
  temperature: number | undefined;
  hitsNumber: number | undefined;
  value: number | undefined;
  measurementHeight: number | undefined;
  description: string | undefined;
  tags: string[] | undefined;
  measurementEnvironment: MeasureEnvironment | undefined;
  rain: boolean | undefined;
}
