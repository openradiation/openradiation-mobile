import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { map } from 'rxjs/operators';
import { Measure, Step } from '../measures/measure';
import { DeviceType } from './abstract-device';
import { DeviceSafeCast } from './device-safe-cast';

// Todo add inheritance when angular issue fixed https://github.com/angular/angular/issues/24011
@Injectable({
  providedIn: 'root'
})
export class DeviceSafeCastService /*extends AbstractDeviceService<DeviceSafeCast>*/ {
  private firmwareService = '';
  private firmwareCharacteristic = '';
  private service = 'ef080d8c-c3be-41ff-bd3f-05a5f4795d7f';
  private settingsCharacteristic = 'A1E8F5B1-696B-4E4C-87C6-69DFE0B0093B';

  constructor(protected ble: BLE) {}

  getDeviceInfo(device: DeviceSafeCast): Observable<Partial<DeviceSafeCast>> {
    return fromPromise(this.ble.read(device.sensorUUID, this.firmwareService, this.firmwareCharacteristic)).pipe(
      map(buffer => {
        const firmwareVersion = new TextDecoder('utf8').decode(new Uint8Array(buffer));
        return {
          apparatusVersion: `${DeviceType.SafeCast} ${firmwareVersion}`
        };
      })
    );
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
