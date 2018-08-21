import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Observable, of } from 'rxjs';
import { DeviceAtomTag } from './device';
import { map } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { DeviceType } from './abstract-device';

// Todo add inheritance when angular issue fixed https://github.com/angular/angular/issues/24011
@Injectable({
  providedIn: 'root'
})
export class DeviceAtomTagService /*extends AbstractDeviceService<DeviceAtomTag>*/ {
  private static firmwareServiceUUIID = '180a';
  private static firmwareCharacteristic = '2a26';
  private static settingsCharacteristic = 'EA50CFCD­AC4A­4A48­BF0E­879E548AE157';

  constructor(protected ble: BLE) {}

  getDeviceInfo(device: DeviceAtomTag): Observable<Partial<DeviceAtomTag>> {
    return fromPromise(
      this.ble.read(
        device.sensorUUID,
        DeviceAtomTagService.firmwareServiceUUIID,
        DeviceAtomTagService.firmwareCharacteristic
      )
    ).pipe(
      map(buffer => {
        const firmwareVersion = new TextDecoder('utf8').decode(new Uint8Array(buffer));
        return {
          apparatusSensorType: 'geiger',
          apparatusTubeType: 'SBM-20',
          apparatusVersion: `${DeviceType.AtomTag} ${firmwareVersion}`
        };
      })
    );
  }

  saveDeviceParams(device: DeviceAtomTag): Observable<any> {
    return of(null);
  }
}
