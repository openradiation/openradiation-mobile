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
  hitsAccuracyThreshold = {
    bad: 4,
    medium: 15,
    good: 30,
    accurate: 50
  };
  abstract hitsPeriod: number;
}

export interface RawDevice {
  name: string;
}

export enum ApparatusSensorType {
  Geiger = 'geiger',
  Photodiode = 'photodiode'
}

export enum DeviceType {
  Mock = 'Mock',
  OGKit = 'OG-KIT1',
  AtomTag = 'AtomTag',
  SafeCast = 'bGeigieBLE',
  PocketGeiger = 'Pocket Geiger Type 6',
  Rium = 'RiumGm',
  Rium2USB = 'RiumGM BLE -u'
  // Rium2BLE = 'RiumGM BLE -b' TODO
}

// The key set the threshold and the value is the calibration function
export interface CalibrationFunctions {
  0: string;
  [key: number]: string;
}
