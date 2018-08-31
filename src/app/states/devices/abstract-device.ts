export abstract class AbstractDevice {
  abstract readonly deviceType: DeviceType;
  apparatusVersion: string;
  apparatusId: string;
  sensorUUID: string;
  apparatusSensorType: string;
  apparatusTubeType: string;
  params?: DeviceParams;
  paramsModel?: DeviceParamsModel;
  batteryLevel?: number;

  constructor(rawDevice: RawDevice) {
    this.sensorUUID = rawDevice.id;
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

export interface DeviceParamsModel {
  [K: string]: DeviceParamModel;
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
