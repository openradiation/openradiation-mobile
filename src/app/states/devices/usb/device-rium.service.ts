import { Injectable } from '@angular/core';
import { Actions, Store } from '@ngxs/store';
import { Observable, of, throwError } from 'rxjs';
import { concatMap, filter, map, take } from 'rxjs/operators';
import { Step } from '@app/states/measures/measure';
import { ConnectDevice, UpdateDeviceInfo } from '@app/states/devices/devices.action';
import { AbstractUSBDeviceService } from './abstract-usb-device.service';
import { DeviceRium } from './device-rium';
import { DeviceRium2USB } from './device-rium-2-usb';

@Injectable({
  providedIn: 'root'
})
export class DeviceRiumService extends AbstractUSBDeviceService<DeviceRium> {
  protected calibrationFunctions = {
    planeMode: {
      0: '(0.00000003751 * (cps * 60 - 4) ^ 2 + 0.00965 * (cps * 60 - 4)) * 0.85',
      1.5: 'cps * 1.14'
    },
    groundLevel: {
      0: '(0.00000003751 * (cps * 60 - 4) ^ 2 + 0.00965 * (cps * 60 - 4)) * 0.85'
    }
  };

  constructor(protected store: Store, protected actions$: Actions) {
    super(store, actions$);
  }

  connectDevice(device: DeviceRium): Observable<unknown> {
    return super.connectDevice(device).pipe(
      concatMap(() => this.receiveData()),
      concatMap((dataView: DataView) => {
        if (dataView.buffer.byteLength === 12) {
          return of(null);
        } else if (dataView.buffer.byteLength === 32) {
          // If we detect this buffer size if means the connected device is an new Rium and we switch to the correct service
          const correctDevice = new DeviceRium2USB();
          this.store
            .dispatch(new ConnectDevice(correctDevice))
            .subscribe(() => this.store.dispatch(new UpdateDeviceInfo(correctDevice)));

          return throwError('new Rium detected');
        } else {
          return of();
        }
      }),
      take(1)
    );
  }

  getDeviceInfo(_device: DeviceRium): Observable<Partial<DeviceRium>> {
    return this.receiveData().pipe(
      map((dataView: DataView) => {
        if (dataView.buffer.byteLength === 12) {
          const apparatusId = dataView.getUint32(2, false).toString();
          return {
            apparatusId
          };
        } else {
          return null;
        }
      }),
      filter((update: Partial<DeviceRium> | null): update is Partial<DeviceRium> => update !== null),
      take(1)
    );
  }

  saveDeviceParams(_device: DeviceRium): Observable<unknown> {
    return of(null);
  }

  startMeasureScan(device: DeviceRium, stopSignal: Observable<unknown>): Observable<Step> {
    return this.receiveData(stopSignal).pipe(
      map((dataView: DataView) => this.decodeDataPackage(dataView)),
      filter((step: Step | null): step is Step => step !== null)
    );
  }

  protected decodeDataPackage(dataView: DataView): Step | null {
    if (dataView.buffer.byteLength === 12) {
      const hitsNumber = dataView.getInt16(6);
      const temperature = dataView.getInt16(10) / 10;
      return {
        ts: Date.now(),
        hitsNumber,
        temperature
      };
    }
    return null;
  }

  buildDevice(): DeviceRium {
    return new DeviceRium();
  }
}
