import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import {
  AbstractDevice,
  DeviceParams,
  DeviceParamsModel,
  DeviceParamType,
  DeviceType,
  RawDevice
} from './abstract-device';

export class DeviceSafeCast extends AbstractDevice {
  readonly deviceType = DeviceType.SafeCast;
  apparatusVersion = 'bGeigieBLEv201';
  apparatusSensorType = 'Geiger';
  apparatusTubeType = 'LND 7317 pancake';

  params: DeviceParams = {
    audioHits: false,
    vibrationHits: false
  };

  constructor(rawDevice: RawDevice) {
    super(rawDevice);
    this.apparatusVersion = DeviceType.SafeCast;
    this.apparatusId = rawDevice.id;
  }
}
