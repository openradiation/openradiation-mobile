import { Injectable } from '@angular/core';
import { Actions, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { Step } from '../../measures/measure';
import { AbstractUSBDeviceService } from './abstract-usb-device.service';
import { DevicePocketGeiger } from './device-pocket-geiger';

@Injectable({
  providedIn: 'root'
})
export class DevicePocketGeigerService extends AbstractUSBDeviceService<DevicePocketGeiger> {
  protected calibrationFunctions = {
    planeMode: {
      0: 'cps / 0.88387',
      0.25: 'cps * 7.2'
    },
    groundLevel: {
      0: 'cps / 0.88387'
    }
  };

  private SEND_GET_HITS = 'S\n';
  private RECEIVE_GET_HITS = '>';
  private NOISE_REJECT_DURATION = 200;
  private noiseTimeout = 0;

  constructor(protected store: Store, protected actions$: Actions) {
    super(store, actions$);
  }

  getDeviceInfo(_device: DevicePocketGeiger): Observable<Partial<DevicePocketGeiger>> {
    return of({});
  }

  saveDeviceParams(_device: DevicePocketGeiger): Observable<unknown> {
    return of(null);
  }

  startMeasureScan(device: DevicePocketGeiger, stopSignal: Observable<unknown>): Observable<Step> {
    this.sendData(this.SEND_GET_HITS);
    return this.receiveData(stopSignal).pipe(
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
