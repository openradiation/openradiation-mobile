import { BLE } from '@ionic-native/ble/ngx';
import { AbstractDeviceService } from '../abstract-device.service';
import { AbstractBLEDevice } from './abstract-ble-device';

export abstract class AbstractBLEDeviceService<T extends AbstractBLEDevice> extends AbstractDeviceService<T> {
  constructor(protected ble: BLE) {
    super();
  }
}
