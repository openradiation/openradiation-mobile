import {
  AbstractDevice,
  DeviceParams,
  DeviceParamsModel,
  DeviceParamType,
  DeviceType,
  RawDevice
} from './abstract-device';

export class DeviceOGKit extends AbstractDevice {
  readonly deviceType = DeviceType.OGKit;
  apparatusVersion = DeviceType.OGKit;

  params: DeviceParams = {
    audioHits: true,
    visualHits: true
  };
  paramsModel: DeviceParamsModel = {
    audioHits: {
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
