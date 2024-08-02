import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DeviceType } from '../abstract-device';
import { DeviceParams, DeviceParamsModel, DeviceParamType } from '../device-params';
import { AbstractBLEDevice, RawBLEDevice } from './abstract-ble-device';

export enum DeviceOGKit2Type {
  OPENG = 'OPENGKIT72'
}

export class DeviceOGKit2 extends AbstractBLEDevice {
  readonly deviceType = DeviceType.OGKit2;
  hitsPeriod = 1000;

  params: DeviceParams = {
    audioHits: true,
    visualHits: true
  };
  paramsModel: DeviceParamsModel = {
    audioHits: {
      label: _('SENSORS.PARAM.AUDIO_HITS') as string,
      type: DeviceParamType.Boolean
    },
    visualHits: {
      label: _('SENSORS.PARAM.VISUAL_HITS') as string,
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
