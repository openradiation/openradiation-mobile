import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Observable, of } from 'rxjs';
import { filter, scan, shareReplay, take, tap } from 'rxjs/operators';
import { DeviceOGKit } from './device-og-kit';

// Todo add inheritance when angular issue fixed https://github.com/angular/angular/issues/24011
@Injectable({
  providedIn: 'root'
})
export class DeviceOGKitService /*extends AbstractDeviceService<DeviceOGKit>*/ {
  private static serviceUUID = '00002220-0000-1000-8000-00805F9B34FB';
  private static sendCharacteristic = '00002222-0000-1000-8000-00805F9B34FB';
  private static receiveCharacteristic = '00002221-0000-1000-8000-00805F9B34FB';

  private static OUT_PACKET_SENSOR_TYPE = 3;
  private static OUT_PACKET_TUBE_TYPE = 16;

  constructor(protected ble: BLE) {}

  getDeviceInfo(device: DeviceOGKit): Observable<Partial<DeviceOGKit>> {
    const startNotification = this.ble
      .startNotification(device.sensorUUID, DeviceOGKitService.serviceUUID, DeviceOGKitService.receiveCharacteristic)
      .pipe(shareReplay());
    startNotification.subscribe();
    const data = new Uint8Array([0x12]);
    this.ble.write(device.sensorUUID, DeviceOGKitService.serviceUUID, DeviceOGKitService.sendCharacteristic, <
      ArrayBuffer
    >data.buffer);
    return startNotification.pipe(
      scan((update: Partial<DeviceOGKit>, buffer: ArrayBuffer) => {
        const array = new Uint8Array(buffer);
        switch (array[0]) {
          case DeviceOGKitService.OUT_PACKET_SENSOR_TYPE:
            update.apparatusSensorType = DeviceOGKitService.decodeBuffer(array);
            break;
          case DeviceOGKitService.OUT_PACKET_TUBE_TYPE:
            update.apparatusTubeType = DeviceOGKitService.decodeBuffer(array);
            break;
        }
        return update;
      }, {}),
      filter(update => update.apparatusSensorType !== undefined && update.apparatusTubeType !== undefined),
      take(1),
      tap(() =>
        this.ble.stopNotification(
          device.sensorUUID,
          DeviceOGKitService.serviceUUID,
          DeviceOGKitService.receiveCharacteristic
        )
      )
    );
  }

  saveDeviceParams(device: DeviceOGKit): Observable<any> {
    return of(null);
  }

  private static decodeBuffer(array: Uint8Array): string {
    return new TextDecoder('utf8').decode(array.slice(2, 2 + array[1]));
  }
}
