import { AbstractDevice, DeviceParams, DeviceParamType, DeviceType } from './abstract-device';

export class DeviceOGKit extends AbstractDevice {
  readonly apparatusVersion = DeviceType.OGKIT;

  params: DeviceParams = {
    audiHits: true,
    visualHist: true
  };
  paramsModel = {
    audiHits: {
      label: 'audiHits',
      type: DeviceParamType.boolean
    },
    visualHist: {
      label: 'visualHits',
      type: DeviceParamType.boolean
    }
  };
}

export type Device = DeviceOGKit;
