import { AbstractDevice, DeviceParams, DeviceParamType, DeviceType } from './abstract-device';

export class DeviceOGKit extends AbstractDevice {
  readonly apparatusVersion = DeviceType.OGKit;

  params: DeviceParams = {
    audiHits: true,
    visualHits: true
  };
  paramsModel = {
    audiHits: {
      label: 'Signal audio pour les coups',
      type: DeviceParamType.boolean
    },
    visualHits: {
      label: 'Signal visuel pour les coups',
      type: DeviceParamType.boolean
    }
  };
}

export class DeviceAtomTag extends AbstractDevice {
  readonly apparatusVersion: DeviceType = DeviceType.AtomTag;

  params: DeviceParams = {
    audiHits: true,
    vibrationHits: true
  };
  paramsModel = {
    audiHits: {
      label: 'Signal audio pour les coups',
      type: DeviceParamType.boolean
    },
    vibrationHits: {
      label: 'Vibration pour les coups',
      type: DeviceParamType.boolean
    }
  };
}

export type Device = DeviceOGKit | DeviceAtomTag;
