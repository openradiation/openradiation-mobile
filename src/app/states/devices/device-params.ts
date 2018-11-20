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
  String,
  Boolean,
  Number
}

export type DeviceParamValue = string | boolean | number;
