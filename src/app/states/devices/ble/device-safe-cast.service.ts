import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { bufferCount, filter, map, tap } from 'rxjs/operators';
import { Step } from '../../measures/measure';
import { DeviceType } from '../abstract-device';
import { RawBLEDevice } from './abstract-ble-device';
import { AbstractBLEDeviceService } from './abstract-ble-device.service';
import { DeviceSafeCast } from './device-safe-cast';

@Injectable({
  providedIn: 'root'
})
export class DeviceSafeCastService extends AbstractBLEDeviceService<DeviceSafeCast> {
  protected calibrationFunctions = {
    planeMode: {
      0: 'cps / 5.56667'
    },
    groundLevel: {
      0: 'cps / 5.56667'
    }
  };

  protected service = 'ef080d8c-c3be-41ff-bd3f-05a5f4795d7f';
  protected receiveCharacteristic = 'a1e8f5b1-696b-4e4c-87c6-69dfe0b0093b';

  constructor(protected store: Store, protected ble: BLE) {
    super(store, ble);
  }

  getDeviceInfo(device: DeviceSafeCast): Observable<Partial<DeviceSafeCast>> {
    return of({});
  }

  saveDeviceParams(device: DeviceSafeCast): Observable<any> {
    return of(null);
  }

  startMeasureScan(device: DeviceSafeCast, stopSignal: Observable<any>): Observable<Step> {
    stopSignal.subscribe(() => this.stopReceiveData(device));
    let readingBufferSequence = false;
    return this.startReceiveData(device).pipe(
      filter((buffer: ArrayBuffer) => {
        const dataView = new DataView(buffer);
        return dataView.getUint8(0) === 36 || readingBufferSequence;
      }),
      tap(() => (readingBufferSequence = true)),
      bufferCount(18),
      tap(() => (readingBufferSequence = false)),
      map(buffers => this.decodeDataPackage(buffers))
    );
  }

  protected decodeDataPackage(buffers: ArrayBuffer[]): Step {
    const data = buffers
      .map(buffer => this.textDecoder.decode(buffer))
      .join('')
      .split(',');
    return {
      ts: Date.now(),
      hitsNumber: Number(data[4])
    };
  }

  buildDevice(rawBLEDevice: RawBLEDevice): DeviceSafeCast | null {
    if (rawBLEDevice.name.includes(DeviceType.SafeCast)) {
      return new DeviceSafeCast(rawBLEDevice);
    }
    return null;
  }
}
