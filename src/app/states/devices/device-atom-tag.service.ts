import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Observable, of } from 'rxjs';
import { DeviceAtomTag } from './device';

// Todo add inheritance when angular issue fixed https://github.com/angular/angular/issues/24011
@Injectable({
  providedIn: 'root'
})
export class DeviceAtomTagService /*extends AbstractDeviceService<DeviceAtomTag>*/ {
  static serviceUUID = '63462A4A-C28C-4FFD-87A4-2D23A1C72581';
  private static sendCharacteristic = '3F71E820-1D98-46D4-8ED6-324C8428868C';
  private static receiveCharacteristic = '70BC767E-7A1A-4304-81ED-14B9AF54F7BD';

  constructor(protected ble: BLE) {}

  getDeviceInfo(): Observable<Partial<DeviceAtomTag>> {
    return of({
      apparatusSensorType: 'geiger',
      apparatusTubeType: 'SBM-20'
    });
  }
}
