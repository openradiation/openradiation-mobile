import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Observable, of } from 'rxjs';
import { Measure, Step } from '../measures/measure';
import { DeviceSafeCast } from './device-safe-cast';

// Todo add inheritance when angular issue fixed https://github.com/angular/angular/issues/24011
@Injectable({
  providedIn: 'root'
})
export class DeviceSafeCastService /*extends AbstractDeviceService<DeviceSafeCast>*/ {
  private service = 'ef080d8c-c3be-41ff-bd3f-05a5f4795d7f';
  private settingsCharacteristic = '38117f3c-28ab-4718-ab95-172b363f2ae0';

  constructor(protected ble: BLE) {}

  getDeviceInfo(): Observable<Partial<DeviceSafeCast>> {
    return of({});
  }

  // TODO implement correct computation for SafeCast
  computeRadiationValue(measure: Measure): number {
    return 0;
  }

  // TODO implement start measure for SafeCast
  startMeasureScan(device: DeviceSafeCast, stopSignal: Observable<any>): Observable<Step> {
    return of();
  }
}
