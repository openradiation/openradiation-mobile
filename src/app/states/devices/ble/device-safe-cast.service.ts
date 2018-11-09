import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { bufferCount, filter, map, tap } from 'rxjs/operators';
import { Measure, Step } from '../../measures/measure';
import { AbstractBLEDeviceService } from './abstract-ble-device.service';
import { DeviceSafeCast } from './device-safe-cast';

@Injectable({
  providedIn: 'root'
})
export class DeviceSafeCastService extends AbstractBLEDeviceService<DeviceSafeCast> {
  private service = 'ef080d8c-c3be-41ff-bd3f-05a5f4795d7f';
  private receiveCharacteristic = 'a1e8f5b1-696b-4e4c-87c6-69dfe0b0093b';

  constructor(protected store: Store, protected ble: BLE) {
    super(store, ble);
  }

  computeRadiationValue(measure: Measure): number {
    if (measure.endTime) {
      const duration = (measure.endTime - measure.startTime) / 1000;
      const TcNet = measure.hitsNumber / duration;
      return (TcNet * 60) / 334;
    } else {
      throw new Error('Incorrect measure : missing endTime');
    }
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

  private startReceiveData(device: DeviceSafeCast): Observable<any> {
    return this.ble.startNotification(device.sensorUUID, this.service, this.receiveCharacteristic);
  }

  private stopReceiveData(device: DeviceSafeCast) {
    return this.ble.stopNotification(device.sensorUUID, this.service, this.receiveCharacteristic);
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
}
