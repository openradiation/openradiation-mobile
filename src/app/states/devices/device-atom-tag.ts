import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
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
  apparatusVersion: string = DeviceType.AtomTag;
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
    if (rawDevice.advertising instanceof ArrayBuffer) {
      const data = new Uint8Array(rawDevice.advertising);
      this.batteryLevel = data[28];
    } else {
      const data = new Uint8Array(rawDevice.advertising.kCBAdvDataManufacturerData);
      this.batteryLevel = data[1];
    }
    this.apparatusId = rawDevice.id;
  }
}
