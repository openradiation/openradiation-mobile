export abstract class AbstractDevice {
  abstract readonly apparatusVersion: DeviceType;
  apparatusId: string;
  sensorUUID: string;
  apparatusSensorType: string;
  apparatusTubeType: string;
  params?: DeviceParams;
  paramsModel?: { [K: string]: DeviceParamModel };

  constructor(rawDevice: RawDevice) {
    this.sensorUUID = rawDevice.id;
    const manufacturerData = new Uint8Array(rawDevice.advertising).slice(23, 29);
    this.apparatusId = new TextDecoder('utf8').decode(manufacturerData);
  }
}

export enum DeviceType {
  OGKit = 'OG-KIT1',
  AtomTag = 'AtomTag'
}

export interface RawDevice {
  name: string;
  id: string;
  advertising: ArrayBuffer;
  rssi: number;
  characteristics?: {
    characteristic: string;
    properties: string[];
    descriptors: any[];
    service: string;
  }[];
}

export interface DeviceParams {
  [K: string]: DeviceParamValue;
}

export interface DeviceParamModel {
  label: string;
  type: DeviceParamType;
}

export enum DeviceParamType {
  string,
  boolean,
  number
}

export type DeviceParamValue = string | boolean | number;
