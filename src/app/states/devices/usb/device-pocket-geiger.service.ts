import { Injectable } from '@angular/core';
import { Serial } from '@ionic-native/serial/ngx';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';
import { Measure, Step } from '../../measures/measure';
import { AbstractUSBDeviceService } from './abstract-usb-device.service';
import { DevicePocketGeiger } from './device-pocket-geiger';

@Injectable({
  providedIn: 'root'
})
export class DevicePocketGeigerService extends AbstractUSBDeviceService<DevicePocketGeiger> {
  private SEND_GET_HITS = 'S\n';
  private RECEIVE_GET_HITS = '>';

  constructor(protected store: Store, protected serial: Serial) {
    super(store, serial);
  }

  computeRadiationValue(measure: Measure): number {
    if (measure.endTime) {
      const duration = (measure.endTime - measure.startTime) / 1000;
      const TcNet = measure.hitsNumber / duration;
      return (TcNet * 60) / 53.032;
    } else {
      throw new Error('Incorrect measure : missing endTime');
    }
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
      map((buffer: ArrayBuffer) => this.decodeDataPackage(buffer)),
      startWith({ ts: Date.now(), hitsNumber: 0 }),
      filter((step: Step | null): step is Step => step !== null)
    );
  }

  protected decodeDataPackage(buffer: ArrayBuffer): Step | null {
    const data = this.textDecoder.decode(buffer);
    if (data[0] === this.RECEIVE_GET_HITS) {
      const hitsNumber = Number(data.slice(1).split(',')[0]);
      if (hitsNumber) {
        return {
          ts: Date.now(),
          hitsNumber
        };
      }
    }
    return null;
  }
}
