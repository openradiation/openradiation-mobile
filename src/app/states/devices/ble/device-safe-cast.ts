import { ApparatusSensorType, DeviceType } from '../abstract-device';
import { AbstractBLEDevice, RawBLEDevice } from './abstract-ble-device';

export class DeviceSafeCast extends AbstractBLEDevice {
  readonly deviceType = DeviceType.SafeCast;
  apparatusVersion: string = DeviceType.SafeCast;
  apparatusSensorType = ApparatusSensorType.Geiger;
  apparatusTubeType = 'LND 7317 pancake';

  constructor(rawDevice: RawBLEDevice) {
    super(rawDevice);
    this.apparatusVersion = rawDevice.name;
    this.apparatusId = rawDevice.id;
  }
}
