import { BLE } from '@ionic-native/ble/ngx';
import { Observable } from 'rxjs/internal/Observable';
import { AbstractDevice } from './abstract-device';

export abstract class AbstractDeviceService<T extends AbstractDevice> {
  constructor(protected ble: BLE) {}

  abstract getDeviceInfo(device: T): Observable<Partial<T>>;
}
