import { Injectable } from '@angular/core';
import { Serial } from '@ionic-native/serial/ngx';
import { Actions, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';
import { Step } from '../../measures/measure';
import { AbstractUSBDeviceService } from './abstract-usb-device.service';
import { DevicePocketGeiger } from './device-pocket-geiger';
import { DeviceRium } from './device-rium';

@Injectable({
  providedIn: 'root'
})
export class DeviceRiumService extends AbstractUSBDeviceService<DeviceRium> {
  constructor(protected store: Store, protected serial: Serial, protected actions$: Actions) {
    super(store, serial, actions$);
  }

  protected convertHitsNumberPerSec(hitsNumberPerSec: number): number {
    return (hitsNumberPerSec * 60) / 53.032;
  }

  getDeviceInfo(device: DeviceRium): Observable<Partial<DeviceRium>> {
    return of({});
  }

  saveDeviceParams(device: DeviceRium): Observable<any> {
    return of(null);
  }

  startMeasureScan(device: DeviceRium, stopSignal: Observable<any>): Observable<Step> {
    return this.serial.registerReadCallback().pipe(
      takeUntil(stopSignal),
      filter((buffer: any): buffer is ArrayBuffer => buffer instanceof ArrayBuffer),
      map((buffer: ArrayBuffer) => this.decodeDataPackage(buffer)),
      startWith({ ts: Date.now(), hitsNumber: 0 }),
      filter((step: Step | null): step is Step => step !== null)
    );
  }

  protected decodeDataPackage(buffer: ArrayBuffer): Step | null {
    return null;
  }
}
