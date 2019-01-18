import { Injectable } from '@angular/core';
import { Serial } from '@ionic-native/serial/ngx';
import { Actions, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';
import { Step } from '../../measures/measure';
import { AbstractUSBDeviceService } from './abstract-usb-device.service';
import { DevicePocketGeiger } from './device-pocket-geiger';

@Injectable({
  providedIn: 'root'
})
export class DevicePocketGeigerService extends AbstractUSBDeviceService<DevicePocketGeiger> {
  private SEND_GET_HITS = 'S\n';
  private RECEIVE_GET_HITS = '>';
  private NOISE_REJECT_DURATION = 200;
  private noiseTimeout = 0;

  constructor(protected store: Store, protected serial: Serial, protected actions$: Actions) {
    super(store, serial, actions$);
  }

  protected convertHitsNumberPerSec(hitsNumberPerSec: number): number {
    return (hitsNumberPerSec * 60) / 53.032;
  }

  getDeviceInfo(device: DevicePocketGeiger): Observable<Partial<DevicePocketGeiger>> {
    return of({});
  }

  saveDeviceParams(device: DevicePocketGeiger): Observable<any> {
    return of(null);
  }

  startMeasureScan(device: DevicePocketGeiger, stopSignal: Observable<any>): Observable<Step> {
    this.serial.write(this.SEND_GET_HITS);
    return this.serial.registerReadCallback().pipe(
      takeUntil(stopSignal),
      filter((buffer: any): buffer is ArrayBuffer => buffer instanceof ArrayBuffer),
      filter(() => this.noiseTimeout < Date.now()),
      map((buffer: ArrayBuffer) => this.decodeDataPackage(buffer)),
      startWith({ ts: Date.now(), hitsNumber: 0 }),
      filter((step: Step | null): step is Step => step !== null)
    );
  }

  protected decodeDataPackage(buffer: ArrayBuffer): Step | null {
    const data = this.textDecoder.decode(buffer);
    if (data[0] === this.RECEIVE_GET_HITS) {
      const dataPackage = data.slice(1).split(',');
      const hitsNumber = Number(dataPackage[0]);
      const noise = Number(dataPackage[1]);
      if (noise) {
        this.noiseTimeout = Date.now() + this.NOISE_REJECT_DURATION;
      } else {
        if (hitsNumber) {
          return {
            ts: Date.now(),
            hitsNumber
          };
        }
      }
    }
    return null;
  }

  buildDevice(): DevicePocketGeiger {
    return new DevicePocketGeiger();
  }
}
