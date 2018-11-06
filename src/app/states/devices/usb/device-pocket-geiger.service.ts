import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Measure, Step } from '../../measures/measure';
import { AbstractUSBDeviceService } from './abstract-usb-device.service';
import { DevicePocketGeiger } from './device-pocket-geiger';

/*this.serial
  .requestPermission({ vid: '4D8', pid: 'F46F', driver: 'CdcAcmSerialDriver' })
  .then(() => {
    this.serial
      .open({
        baudRate: 38400,
        dataBits: 4,
        stopBits: 1,
        parity: 0,
        dtr: false,
        rts: false,
        sleepOnPause: false
      })
      .then(() => {
        console.log('Serial connection opened');
      });
  })
  .catch((error: any) => console.log(error));*/

@Injectable({
  providedIn: 'root'
})
export class DevicePocketGeigerService extends AbstractUSBDeviceService<DevicePocketGeiger> {
  // Todo remove when angular issue fixed https://github.com/angular/angular/issues/24011
  static ngInjectableDef = undefined;

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
