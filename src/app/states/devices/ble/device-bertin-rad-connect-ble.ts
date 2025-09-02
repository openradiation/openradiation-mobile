import { ApparatusSensorType, DeviceType } from '@app/states/devices/abstract-device';
import { AbstractBLEDevice, RawBLEDevice } from './abstract-ble-device';

export class DeviceBertinRadConnectBLE extends AbstractBLEDevice {
  readonly deviceType = DeviceType.BertinRadConnect;
  apparatusVersion: string = DeviceType.BertinRadConnect;
  apparatusSensorType = ApparatusSensorType.Geiger;
  apparatusTubeType = 'J305γβ'; // TODO Bertin check this value
  hitsPeriod = 1000; // TODO Bertin  check this value

  constructor(rawDevice: RawBLEDevice) {
    super(rawDevice);
  }
}
