import { Injectable } from '@angular/core';
import { Serial } from '@ionic-native/serial/ngx';
import { Actions, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';
import { Step } from '../../measures/measure';
import { AbstractUSBDeviceService } from './abstract-usb-device.service';
import { DeviceRium } from './device-rium';

@Injectable({
  providedIn: 'root'
})
export class DeviceRiumService extends AbstractUSBDeviceService<DeviceRium> {
  constructor(protected store: Store, protected serial: Serial, protected actions$: Actions) {
    super(store, serial, actions$);
  }

  protected convertHitsNumberPerSec(hitsNumberPerSec: number): number {
    // TODO fix conversion factor
    return (hitsNumberPerSec * 60) / 53.032;
  }

  getDeviceInfo(device: DeviceRium): Observable<Partial<DeviceRium>> {
    return of({});
  }

  saveDeviceParams(device: DeviceRium): Observable<any> {
    return of(null);
  }

  startMeasureScan(device: DeviceRium, stopSignal: Observable<any>): Observable<Step> {
    console.log('startmeasure');
    // let stop = false;
    // while (!stop) {
    //   console.log('in while');
    this.serial
      .read()
      .then(console.log)
      .catch(console.error)
      .finally(() => this.serial.close());
    //   stopSignal.subscribe(() => (stop = true));
    // }
    return of({ ts: Date.now(), hitsNumber: 0, temperature: 0 });
    // return this.serial.registerReadCallback().pipe(
    //   takeUntil(stopSignal),
    //   filter((buffer: any): buffer is ArrayBuffer => buffer instanceof ArrayBuffer),
    //   map((buffer: ArrayBuffer) => this.decodeDataPackage(buffer)),
    //   startWith({ ts: Date.now(), hitsNumber: 0, temperature: 0 }),
    //   filter((step: Step | null): step is Step => step !== null)
    // );
  }

  protected decodeDataPackage(buffer: ArrayBuffer): Step | null {
    const data = this.textDecoder.decode(buffer);
    console.log('data', data);
    const dataPackage = data.slice(1).split('-');
    const hitsNumber = 1;
    if (hitsNumber) {
      return {
        ts: Date.now(),
        hitsNumber
      };
    }
    return null;
  }
}
