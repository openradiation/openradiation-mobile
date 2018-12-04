import { BLE } from '@ionic-native/ble/ngx';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { catchError, concatMap, shareReplay, take } from 'rxjs/operators';
import { AbstractDeviceService } from '../abstract-device.service';
import { DeviceConnectionLost } from '../devices.action';
import { AbstractBLEDevice } from './abstract-ble-device';

export abstract class AbstractBLEDeviceService<T extends AbstractBLEDevice> extends AbstractDeviceService<T> {
  protected abstract service: string;
  protected abstract receiveCharacteristic: string;

  constructor(protected store: Store, protected ble: BLE) {
    super(store);
  }

  connectDevice(device: T): Observable<any> {
    const connection = this.ble.connect(device.sensorUUID).pipe(
      concatMap(() => this.saveDeviceParams(device)),
      shareReplay()
    );
    connection.pipe(catchError(() => this.store.dispatch(new DeviceConnectionLost()))).subscribe();
    return connection.pipe(take(1));
  }

  disconnectDevice(device: T): Observable<any> {
    return fromPromise(this.ble.disconnect(device.sensorUUID));
  }

  protected startReceiveData(device: T): Observable<any> {
    return this.ble.startNotification(device.sensorUUID, this.service, this.receiveCharacteristic);
  }

  protected stopReceiveData(device: T) {
    return this.ble.stopNotification(device.sensorUUID, this.service, this.receiveCharacteristic);
  }
}
