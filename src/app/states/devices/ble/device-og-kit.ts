import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { DeviceType } from '../abstract-device';
import { DeviceParams, DeviceParamsModel, DeviceParamType } from '../device-params';
import { AbstractBLEDevice, RawBLEDevice } from './abstract-ble-device';

export enum DeviceOgKitType {
  OG = 'OG',
  OPENG = 'OPENG'
}

export class DeviceOGKit extends AbstractBLEDevice {
  readonly deviceType = DeviceType.OGKit;
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
    this.apparatusVersion = rawDevice.name;
    let advertising: Uint8Array;
    if (rawDevice.advertising instanceof ArrayBuffer) {
      const manufacturerData = new Uint8Array(rawDevice.advertising);
      const index = manufacturerData.indexOf(0xff);
      advertising = manufacturerData.slice(index + 3, index + manufacturerData[index - 1]);
    } else {
      advertising = new Uint8Array(rawDevice.advertising.kCBAdvDataManufacturerData);
    }

    this.apparatusId = new TextDecoder('utf8').decode(advertising).replace(/\0/g, '');
  }
}
