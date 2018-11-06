import { DeviceParams, DeviceParamsModel } from './device-params';

export abstract class AbstractDevice {
  abstract readonly deviceType: DeviceType;
  apparatusVersion: string;
  apparatusId?: string;
  sensorUUID: string;
  apparatusSensorType: ApparatusSensorType;
  apparatusTubeType?: string;
  params?: DeviceParams;
  paramsModel?: DeviceParamsModel;
  batteryLevel?: number;
}

export enum ApparatusSensorType {
  Geiger = 'geiger',
  Photodiode = 'photodiode'
}

export enum DeviceType {
  OGKit = 'OG-KIT1',
  AtomTag = 'AtomTag',
  SafeCast = 'bGeigieBLE',
  PocketGeiger = 'Pocket Geiger Type 6'
}
