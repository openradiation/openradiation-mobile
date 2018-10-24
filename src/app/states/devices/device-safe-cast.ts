import { AbstractDevice, DeviceParams, DeviceType, RawDevice } from './abstract-device';

export class DeviceSafeCast extends AbstractDevice {
  readonly deviceType = DeviceType.SafeCast;
  apparatusVersion: string = DeviceType.SafeCast;
  apparatusSensorType = 'Geiger';
  apparatusTubeType = 'LND 7317 pancake';

  params: DeviceParams = {
    audioHits: false,
    vibrationHits: false
  };

  constructor(rawDevice: RawDevice) {
    super(rawDevice);
    this.apparatusVersion = rawDevice.name;
    this.apparatusId = rawDevice.id;
  }
}
