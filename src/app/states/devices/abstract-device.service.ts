import { BLE } from '@ionic-native/ble/ngx';
import { Observable } from 'rxjs';
import { AbstractDevice } from './abstract-device';

export abstract class AbstractDeviceService<T extends AbstractDevice> {
  constructor(protected ble: BLE) {}

  abstract getDeviceInfo(device: T): Observable<Partial<T>>;

  abstract saveDeviceParams(device: T): Observable<any>;

  abstract startMeasureScan(device: T): Observable<any>;
}
