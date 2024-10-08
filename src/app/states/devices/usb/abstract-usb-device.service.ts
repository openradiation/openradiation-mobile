import { Actions, Store } from '@ngxs/store';
import { UsbSerial } from 'cordova-plugin-usb-serial';
import { Observable, Observer, of } from 'rxjs';
import { catchError, concatMap, shareReplay, take, takeUntil } from 'rxjs/operators';
import { AbstractDeviceService } from '@app/states/devices/abstract-device.service';
import { DeviceConnectionLost } from '@app/states/devices/devices.action';
import { AbstractUSBDevice } from './abstract-usb-device';

/**
 * Constant from cordova-plugin-usb-serial
 */
declare const UsbSerial: UsbSerial;

export abstract class AbstractUSBDeviceService<T extends AbstractUSBDevice> extends AbstractDeviceService<T> {
  protected constructor(protected store: Store, protected actions$: Actions) {
    super(store);
  }

  abstract buildDevice(): T;

  connectDevice(device: T): Observable<unknown> {
    const connection = Observable.create((observer: Observer<unknown>) =>
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

  disconnectDevice(_device: T): Observable<unknown> {
    return new Observable((observer: Observer<unknown>) =>
      UsbSerial.disconnect(
        () => {
          observer.next(null);
          observer.complete();
        },
        err => observer.error(err)
      )
    );
  }

  protected receiveData(stopSignal: Observable<unknown> = of()): Observable<DataView> {
    return new Observable<DataView>((observer: Observer<DataView>) => {
      UsbSerial.onDataReceived(data => observer.next(new DataView(data)), err => observer.error(err));
    }).pipe(takeUntil(stopSignal));
  }

  protected sendData(data: string) {
    UsbSerial.write(data);
  }
}
