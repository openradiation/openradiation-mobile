import {
  AbstractDevice,
  DeviceParams,
  DeviceParamsModel,
  DeviceParamType,
  DeviceType,
  RawDevice
} from './abstract-device';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';

export class DeviceOGKit extends AbstractDevice {
  readonly deviceType = DeviceType.OGKit;
  apparatusVersion = DeviceType.OGKit;

  params: DeviceParams = {
    audioHits: true,
    visualHits: true
  };
  paramsModel: DeviceParamsModel = {
    audioHits: {
      label: <string>_('SENSORS.PARAM.AUDIO_HITS'),
      type: DeviceParamType.boolean
    },
    visualHits: {
      label: <string>_('SENSORS.PARAM.VISUAL_HITS'),
      type: DeviceParamType.boolean
    }
  };

  constructor(rawDevice: RawDevice) {
    super(rawDevice);
    const manufacturerData = new Uint8Array(rawDevice.advertising).slice(23, 29);
    this.apparatusId = new TextDecoder('utf8').decode(manufacturerData);
  }
}
