import { AbstractDevice, DeviceParams, DeviceParamType, DeviceType, RawDevice } from './abstract-device';

export class DeviceOGKit extends AbstractDevice {
  readonly deviceType = DeviceType.OGKit;
  apparatusVersion = DeviceType.OGKit;

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

  constructor(rawDevice: RawDevice) {
    super(rawDevice);
    const manufacturerData = new Uint8Array(rawDevice.advertising).slice(23, 29);
    this.apparatusId = new TextDecoder('utf8').decode(manufacturerData);
  }
}

export class DeviceAtomTag extends AbstractDevice {
  readonly deviceType: DeviceType = DeviceType.AtomTag;
  batteryLevel: number;

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

  constructor(rawDevice: RawDevice) {
    super(rawDevice);
    this.apparatusVersion = DeviceType.AtomTag;
    const data = new Uint8Array(rawDevice.advertising);
    this.batteryLevel = data[28];
    this.apparatusId = rawDevice.id;
  }
}

export type Device = DeviceOGKit | DeviceAtomTag;
