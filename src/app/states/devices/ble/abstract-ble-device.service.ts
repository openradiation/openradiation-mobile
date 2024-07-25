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
    BleClient.initialize();
  }

  abstract buildDevice(rawBLEDevice: RawBLEDevice): T | null;

  connectDevice(device: T): Observable<any> {
    const connection = new Observable((observer) => {
      BleClient.connect(device.sensorUUID,
        // On disconnect, provoque error to trigger RxJS catchError callback
        (deviceId) => {
          observer.error(new Error('Device disconnected : ' + deviceId))
        }
      ).then(() => observer.next())
        .catch(e => observer.error(e));
    }).pipe(
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
    return new Observable(observer => {
      BleClient.startNotifications(
        device.sensorUUID, this.service, this.receiveCharacteristic,
        (value) => {
          observer.next(value);
        }
      ).catch(e => observer.error(e));
    })
  }

  protected stopReceiveData(device: T) {
    BleClient.stopNotifications(device.sensorUUID, this.service, this.receiveCharacteristic);
  }

  protected startNotificationsRx(sensorUUID: string, characteristicId: string): Observable<any> {
    return new Observable<any>(observer => {
      BleClient.startNotifications(sensorUUID, this.service, characteristicId,
        (value) => {
          observer.next(value)
        }
      ).catch(e => observer.error(e));
    });
  }

}
