import { BLE } from '@ionic-native/ble/ngx';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { AbstractDeviceService } from '../abstract-device.service';
import { AbstractBLEDevice } from './abstract-ble-device';

export abstract class AbstractBLEDeviceService<T extends AbstractBLEDevice> extends AbstractDeviceService<T> {
  constructor(protected store: Store, protected ble: BLE) {
    super(store);
  }

  protected getDeviceConnection(device: T): Observable<any> {
    return this.ble.connect(device.sensorUUID);
  }

  disconnectDevice(device: T): Observable<any> {
    return fromPromise(this.ble.disconnect(device.sensorUUID));
  }
}
