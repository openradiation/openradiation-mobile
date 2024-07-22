import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AbstractDevice, ApparatusSensorType, DeviceType } from './abstract-device';
import { DeviceParams, DeviceParamsModel, DeviceParamType } from './device-params';

export class DeviceMock extends AbstractDevice {
  readonly deviceType = DeviceType.Mock;
  apparatusVersion = DeviceType.Mock;
  apparatusSensorType = ApparatusSensorType.Geiger;
  hitsPeriod = 1000;
  sensorUUID = DeviceType.Mock;

  params: DeviceParams = {
    audioHits: true,
    visualHits: true
  };
  paramsModel: DeviceParamsModel = {
    audioHits: {
      label: <string>_('SENSORS.PARAM.AUDIO_HITS'),
      type: DeviceParamType.Boolean
    },
    visualHits: {
      label: <string>_('SENSORS.PARAM.VISUAL_HITS'),
      type: DeviceParamType.Boolean
    }
  };
}
