import { Geoposition } from '@ionic-native/geolocation';
import * as uuid from 'uuid';
import { environment } from '../../../environments/environment';
import { ApparatusSensorType } from '../devices/abstract-device';

export abstract class AbstractMeasure {
  abstract readonly type: MeasureType;
  startTime: number;
  endTime?: number;
  sent = false;

  constructor(public id: string) {}
}

export enum MeasureType {
  Measure = 'Measure',
  MeasureSeries = 'MeasureSeries'
}

export class Measure extends AbstractMeasure {
  readonly type = MeasureType.Measure;
  apparatusId?: string;
  apparatusVersion?: string;
  apparatusSensorType?: ApparatusSensorType;
  apparatusTubeType?: string;
  temperature?: number;
  value: number;
  hitsNumber = 0;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  endLatitude?: number;
  endLongitude?: number;
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
  steps?: Step[] = [];

  constructor(
    apparatusId: string | undefined,
    apparatusVersion: string | undefined,
    apparatusSensorType: ApparatusSensorType | undefined,
    apparatusTubeType: string | undefined,
    deviceUuid: string,
    devicePlatform: string,
    deviceVersion: string,
    deviceModel: string,
    manualReporting = false,
    reportUuid = uuid.v4()
  ) {
    super(reportUuid);
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
    this.accuracy = PositionAccuracyThreshold.No;
    this.endAccuracy = PositionAccuracyThreshold.No;
  }

  static updateStartPosition(measure: Measure, position?: Geoposition): Measure {
    if (position) {
      return {
        ...measure,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy
      };
    } else {
      return { ...measure };
    }
  }

  static updateEndPosition(measure: Measure, position?: Geoposition): Measure {
    if (position) {
      return {
        ...measure,
        endLatitude: position.coords.latitude,
        endLongitude: position.coords.longitude,
        endAccuracy: position.coords.accuracy,
        endAltitude: position.coords.altitude,
        endAltitudeAccuracy: position.coords.altitudeAccuracy
      };
    } else {
      return { ...measure };
    }
  }
}

export interface Step {
  ts: number;
  hitsNumber: number;
  voltage?: number;
  temperature?: number;
}

export enum PositionAccuracyThreshold {
  Good = 0,
  Poor = 50,
  Inaccurate = 500,
  No = Infinity
}

export enum PositionAccuracy {
  Good = 'good',
  Poor = 'poor',
  Inaccurate = 'inaccurate',
  No = 'no'
}

export enum HitsAccuracy {
  Start = 'start',
  Bad = 'bad',
  Medium = 'medium',
  Good = 'good',
  Accurate = 'accurate'
}

export enum HitsAccuracyThreshold {
  Start = 0,
  Bad = 4,
  Medium = 15,
  Good = 30,
  Accurate = 50
}

export enum MeasureEnvironment {
  Countryside = 'countryside',
  City = 'city',
  OnTheRoad = 'ontheroad',
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
  enclosedObject: string | undefined;
  tags: string[] | undefined;
  measurementEnvironment: MeasureEnvironment | undefined;
  rain: boolean | undefined;
}

export interface MeasureSeriesParams {
  seriesDurationLimit: number | undefined;
  measureHitsLimit: number | undefined;
  measureDurationLimit: number | undefined;
}

export interface MeasureSeriesReport {
  seriesNumbersMeasures: number | undefined;
  measureDurationLimit: string | undefined;
  date: string | undefined;
  startTime: string | undefined;
  duration: string | undefined;
  hitsNumberAverage: number | undefined;
  valueAverage: number | undefined;
  measurementHeight: number | undefined;
  description: string | undefined;
  tags: string[] | undefined;
  measurementEnvironment: MeasureEnvironment | undefined;
  rain: boolean | undefined;
}

export class MeasureSeries extends AbstractMeasure {
  readonly type = MeasureType.MeasureSeries;
  measures: Measure[] = [];

  constructor(
    public params: MeasureSeriesParams,
    public seriesUuid = `series_${uuid
      .v4()
      .replace(/-/g, '')
      .slice(-18)}`
  ) {
    super(seriesUuid);
  }

  static addMeasureToSeries(measureSeries: MeasureSeries, measure: Measure) {
    measure.tags = [measureSeries.seriesUuid];
    measure.steps = undefined;
    return {
      ...measureSeries,
      endTime: measure.endTime,
      measures: [...measureSeries.measures, measure]
    };
  }
}
