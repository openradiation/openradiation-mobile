import { AbstractDevice, DeviceParams, DeviceParamType, DeviceType } from './abstract-device';

export class DeviceOGKit extends AbstractDevice {
  readonly apparatusVersion = DeviceType.OGKIT;

  params: DeviceParams = {
    audiHits: true,
    visualHist: true
  };
  paramsModel = {
    audiHits: {
      label: 'Signal audio pour les coups',
      type: DeviceParamType.boolean
    },
    visualHist: {
      label: 'Signal visuel pour les coups',
      type: DeviceParamType.boolean
    }
  };
}

export type Device = DeviceOGKit;
