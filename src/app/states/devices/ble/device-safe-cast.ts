import { ApparatusSensorType, DeviceType } from '../abstract-device';
import { AbstractBLEDevice, RawBLEDevice } from './abstract-ble-device';

export class DeviceSafeCast extends AbstractBLEDevice {
  readonly deviceType = DeviceType.SafeCast;
  apparatusSensorType = ApparatusSensorType.Geiger;
  apparatusTubeType = 'LND 7317 pancake';
  hitsPeriod = 5000;

  constructor(rawDevice: RawBLEDevice) {
    super(rawDevice);
    this.apparatusVersion = rawDevice.name;
    this.apparatusId = rawDevice.id;
  }
}
