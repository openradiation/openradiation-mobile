import {
  AbstractDevice,
  DeviceParams,
  DeviceParamsModel,
  DeviceParamType,
  DeviceType,
  RawDevice
} from './abstract-device';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';

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
      label: <string>_('SENSORS.PARAM.AUDIO_HITS'),
      type: DeviceParamType.Boolean
    },
    vibrationHits: {
      label: <string>_('SENSORS.PARAM.VIBRATION_HITS'),
      type: DeviceParamType.Boolean
    }
  };

  constructor(rawDevice: RawDevice) {
    super(rawDevice);
    console.log(rawDevice);
    this.apparatusVersion = DeviceType.AtomTag;
    if (rawDevice.advertising instanceof ArrayBuffer) {
      const data = new Uint8Array(rawDevice.advertising);
      this.batteryLevel = data[28];
    }
    this.apparatusId = rawDevice.id;
  }
}
