import { Actions, Store } from '@ngxs/store';
import { UsbSerial } from 'cordova-plugin-usb-serial';
import { Observable, Observer } from 'rxjs';
import { catchError, concatMap, shareReplay, take } from 'rxjs/operators';
import { AbstractDeviceService } from '../abstract-device.service';
import { DeviceConnectionLost } from '../devices.action';
import { AbstractUSBDevice } from './abstract-usb-device';

/**
 * Constant from cordova-plugin-usb-serial
 */
declare const UsbSerial: UsbSerial;

export abstract class AbstractUSBDeviceService<T extends AbstractUSBDevice> extends AbstractDeviceService<T> {
  constructor(protected store: Store, protected actions$: Actions) {
    super(store);
  }

  abstract buildDevice(): T;

  connectDevice(device: T): Observable<any> {
    const connection = Observable.create((observer: Observer<any>) =>
      UsbSerial.connect(
        { vid: device.vid, pid: device.pid },
        {
          baudRate: device.baudRate,
          dataBits: device.dataBits
        },
        status => {
          switch (status) {
            case 'connected':
              observer.next(null);
              break;
            case 'disconnected':
              observer.complete();
          }
        },
        err => observer.error(err)
      )
    ).pipe(
      concatMap(() => this.saveDeviceParams(device)),
      shareReplay()
    );
    connection.pipe(catchError(() => this.store.dispatch(new DeviceConnectionLost()))).subscribe();
    return connection.pipe(take(1));
  }

  disconnectDevice(device: T): Observable<any> {
    return Observable.create((observer: Observer<any>) =>
      UsbSerial.disconnect(
        () => {
          observer.next(null);
          observer.complete();
        },
        err => observer.error(err)
      )
    );
  }
}
