import { Injectable } from '@angular/core';
import { Serial } from '@ionic-native/serial/ngx';
import { Observable, of } from 'rxjs';
import { Measure, Step } from '../../measures/measure';
import { AbstractUSBDeviceService } from './abstract-usb-device.service';
import { DevicePocketGeiger } from './device-pocket-geiger';

@Injectable()
export class DevicePocketGeigerService extends AbstractUSBDeviceService<DevicePocketGeiger> {
  constructor(protected serial: Serial) {
    super(serial);
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

  // Todo implement
  startMeasureScan(device: DevicePocketGeiger, stopSignal: Observable<any>): Observable<Step> {
    return of();
  }
}
