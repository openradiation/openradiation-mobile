import { AbstractDevice } from '../devices/abstract-device';
import { Geoposition } from '@ionic-native/geolocation';

export class Measure {
  sensorUUID: string;
  apparatusId: string;
  apparatusVersion: string;
  apparatusSensorType: string;
  apparatusTubeType: string;
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
    device: AbstractDevice,
    position: Geoposition,
    public reportUUID: string,
    public deviceUUID: string,
    public devicePlatform: string,
    public deviceVersion: string,
    public deviceModel: string,
    public tsStart: number,
    public manualReporting = false
  ) {
    this.sensorUUID = device.sensorUUID;
    this.apparatusId = device.apparatusId;
    this.apparatusVersion = device.apparatusVersion;
    this.apparatusSensorType = device.apparatusSensorType;
    this.apparatusTubeType = device.apparatusTubeType;

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
