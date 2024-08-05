import { ApparatusSensorType, DeviceType } from '@app/states/devices/abstract-device';
import { AbstractBLEDevice, RawBLEDevice } from './abstract-ble-device';

export class DeviceRium2BLE extends AbstractBLEDevice {
  readonly deviceType = DeviceType.Rium2BLE;
  apparatusVersion: string = DeviceType.Rium2BLE;
  apparatusSensorType = ApparatusSensorType.Geiger;
  apparatusTubeType = 'J305γβ';
  hitsPeriod = 1000;

  constructor(rawDevice: RawBLEDevice) {
    super(rawDevice);
  }
}
