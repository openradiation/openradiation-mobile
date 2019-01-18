import { Serial } from '@ionic-native/serial/ngx';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { Observable, of, timer } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { catchError, concatMap, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AbstractDeviceService } from '../abstract-device.service';
import { DeviceConnectionLost, DisconnectDevice } from '../devices.action';
import { AbstractUSBDevice } from './abstract-usb-device';

export abstract class AbstractUSBDeviceService<T extends AbstractUSBDevice> extends AbstractDeviceService<T> {
  constructor(protected store: Store, protected serial: Serial, protected actions$: Actions) {
    super(store);
  }

  abstract buildDevice(): T;

  connectDevice(device: T): Observable<any> {
    return fromPromise(
      this.serial.open({
        baudRate: device.baudRate,
        dataBits: device.dataBits,
        stopBits: 1,
        parity: 0,
        dtr: false,
        rts: false,
        sleepOnPause: false
      })
    ).pipe(
      concatMap(() => this.saveDeviceParams(device)),
      catchError(() => this.store.dispatch(new DeviceConnectionLost())),
      tap(() => this.watchDeviceConnection(device))
    );
  }

  private watchDeviceConnection(device: T) {
    timer(1000, 1000)
      .pipe(
        takeUntil(this.actions$.pipe(ofActionDispatched(DisconnectDevice, DeviceConnectionLost))),
        switchMap(() =>
          fromPromise(this.serial.requestPermission({ vid: device.vid, pid: device.pid, driver: device.driver }))
        ),
        catchError(err => {
          if (err === 'No device found!') {
            this.store.dispatch(new DeviceConnectionLost());
            return of(null);
          } else {
            throw err;
          }
        })
      )
      .subscribe();
  }

  disconnectDevice(device: T): Observable<any> {
    return fromPromise(this.serial.close());
  }
}
