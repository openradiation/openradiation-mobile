import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { DeviceType } from '../abstract-device';
import { DeviceParams, DeviceParamsModel, DeviceParamType } from '../device-params';
import { AbstractBLEDevice, RawBLEDevice } from './abstract-ble-device';

export class DeviceOGKit extends AbstractBLEDevice {
  readonly deviceType = DeviceType.OGKit;
  apparatusVersion = DeviceType.OGKit;
  hitsPeriod = 1000;

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

  constructor(rawDevice: RawBLEDevice) {
    super(rawDevice);
    const manufacturerData =
      rawDevice.advertising instanceof ArrayBuffer
        ? new Uint8Array(rawDevice.advertising).slice(23, 29)
        : new Uint8Array(rawDevice.advertising.kCBAdvDataManufacturerData);
    this.apparatusId = new TextDecoder('utf8').decode(manufacturerData).replace(/\0/g, '');
  }
}
