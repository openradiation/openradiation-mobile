import { Store } from '@ngxs/store';
import { Observable, from } from 'rxjs';
import { catchError, concatMap, shareReplay, take } from 'rxjs/operators';
import { AbstractDeviceService } from '../abstract-device.service';
import { DeviceConnectionLost } from '../devices.action';
import { AbstractBLEDevice, RawBLEDevice } from './abstract-ble-device';
import { BleClient } from '@capacitor-community/bluetooth-le';

export abstract class AbstractBLEDeviceService<T extends AbstractBLEDevice> extends AbstractDeviceService<T> {
  protected abstract service: string;
  protected abstract receiveCharacteristic: string;

  protected constructor(protected store: Store) {
    super(store);
  }

  abstract buildDevice(rawBLEDevice: RawBLEDevice): T | null;

  connectDevice(device: T): Observable<any> {
    const connection = BleClient.connect(device.sensorUUID).pipe(
      concatMap(() => this.saveDeviceParams(device)),
      shareReplay()
    );
    connection.pipe(catchError(() => this.store.dispatch(new DeviceConnectionLost()))).subscribe();
    return connection.pipe(take(1));
  }

  disconnectDevice(device: T): Observable<any> {
    return from(BleClient.disconnect(device.sensorUUID));
  }

  protected startReceiveData(device: T): Observable<any> {
    return BleClient.startNotification(device.sensorUUID, this.service, this.receiveCharacteristic);
  }

  protected stopReceiveData(device: T) {
    return BleClient.stopNotification(device.sensorUUID, this.service, this.receiveCharacteristic);
  }
}
