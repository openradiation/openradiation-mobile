import { Injectable } from '@angular/core';
import { Actions, Store } from '@ngxs/store';
import { UsbSerial } from 'cordova-plugin-usb-serial';
import { Observable, Observer, of } from 'rxjs';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';
import { Step } from '../../measures/measure';
import { AbstractUSBDeviceService } from './abstract-usb-device.service';
import { DevicePocketGeiger } from './device-pocket-geiger';

/**
 * Constant from cordova-plugin-usb-serial
 */
declare const UsbSerial: UsbSerial;

@Injectable({
  providedIn: 'root'
})
export class DevicePocketGeigerService extends AbstractUSBDeviceService<DevicePocketGeiger> {
  private SEND_GET_HITS = 'S\n';
  private RECEIVE_GET_HITS = '>';
  private NOISE_REJECT_DURATION = 200;
  private noiseTimeout = 0;

  constructor(protected store: Store, protected actions$: Actions) {
    super(store, actions$);
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
    UsbSerial.write(this.SEND_GET_HITS);
    return Observable.create((observer: Observer<ArrayBuffer>) => {
      UsbSerial.onDataReceived(data => observer.next(data), err => observer.error(err));
    }).pipe(
      takeUntil(stopSignal),
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
