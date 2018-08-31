import {
  AbstractDevice,
  DeviceParams,
  DeviceParamsModel,
  DeviceParamType,
  DeviceType,
  RawDevice
} from './abstract-device';

export class DeviceAtomTag extends AbstractDevice {
  readonly deviceType = DeviceType.AtomTag;
  apparatusSensorType = 'Geiger';
  apparatusTubeType = 'SBM-20';

  params: DeviceParams = {
    audioHits: true,
    vibrationHits: true
  };
  paramsModel: DeviceParamsModel = {
    audioHits: {
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
