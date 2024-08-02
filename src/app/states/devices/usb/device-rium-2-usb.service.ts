import { Injectable } from '@angular/core';
import { Actions, Store } from '@ngxs/store';
import { Observable, of, throwError } from 'rxjs';
import { concatMap, filter, map, take } from 'rxjs/operators';
import { Step } from '../../measures/measure';
import { ConnectDevice, UpdateDeviceInfo } from '../devices.action';
import { AbstractUSBDeviceService } from './abstract-usb-device.service';
import { DeviceRium } from './device-rium';
import { DeviceRium2USB } from './device-rium-2-usb';

@Injectable({
  providedIn: 'root'
})
export class DeviceRium2USBService extends AbstractUSBDeviceService<DeviceRium2USB> {
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

  connectDevice(device: DeviceRium2USB): Observable<unknown> {
    return super.connectDevice(device).pipe(
      concatMap(() => this.receiveData()),
      concatMap((buffer: ArrayBuffer) => {
        if (buffer.byteLength === 32) {
          return of(null);
        } else if (buffer.byteLength === 12) {
          // If we detect this buffer size if means the connected device is an old Rium and we switch to the correct service
          const correctDevice = new DeviceRium();
          this.store
            .dispatch(new ConnectDevice(correctDevice))
            .subscribe(() => this.store.dispatch(new UpdateDeviceInfo(correctDevice)));

          return throwError('old Rium detected');
        } else {
          return of();
        }
      }),
      take(1)
    );
  }

  getDeviceInfo(device: DeviceRium2USB): Observable<Partial<DeviceRium2USB>> {
    return this.receiveData().pipe(
      map((buffer: ArrayBuffer) => {
        if (buffer.byteLength === 32) {
          const data = this.textDecoder.decode(buffer).split(',');
          const apparatusId = data[1];
          const batteryVoltage = Number(data[5]) / 100;
          const batteryLevel = Math.max(0, Math.min(100, 227.27 * batteryVoltage - 840.9));
          return {
            apparatusId,
            batteryLevel
          };
        } else {
          return null;
        }
      }),
      filter((update: Partial<DeviceRium2USB> | null): update is Partial<DeviceRium2USB> => update !== null),
      take(1)
    );
  }

  saveDeviceParams(device: DeviceRium2USB): Observable<unknown> {
    return of(null);
  }

  startMeasureScan(device: DeviceRium2USB, stopSignal: Observable<unknown>): Observable<Step> {
    return this.receiveData(stopSignal).pipe(
      map((buffer: ArrayBuffer) => this.decodeDataPackage(buffer)),
      filter((step: Step | null): step is Step => step !== null)
    );
  }

  protected decodeDataPackage(buffer: ArrayBuffer): Step | null {
    if (buffer.byteLength === 32) {
      const data = this.textDecoder.decode(buffer).split(',');
      const hitsNumber = Number(data[3]);
      const temperature = Number(data[4]) / 10;
      return {
        ts: Date.now(),
        hitsNumber,
        temperature
      };
    }
    return null;
  }

  buildDevice(): DeviceRium2USB {
    return new DeviceRium2USB();
  }
}
