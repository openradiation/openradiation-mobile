import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Observable, of } from 'rxjs';
import { Measure, Step } from '../measures/measure';
import { DeviceSafeCast } from './device-safe-cast';
import { bufferCount, filter, map, tap } from 'rxjs/operators';

// Todo add inheritance when angular issue fixed https://github.com/angular/angular/issues/24011
@Injectable({
  providedIn: 'root'
})
export class DeviceSafeCastService /*extends AbstractDeviceService<DeviceSafeCast>*/ {
  private service = 'ef080d8c-c3be-41ff-bd3f-05a5f4795d7f';
  private receiveCharacteristic = 'a1e8f5b1-696b-4e4c-87c6-69dfe0b0093b';

  constructor(protected ble: BLE) {}

  getDeviceInfo(): Observable<Partial<DeviceSafeCast>> {
    return of({});
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
      map(buffers => this.decodeDataPackage(buffers)),
      filter((step: Step | null): step is Step => step !== null)
    );
  }

  private startReceiveData(device: DeviceSafeCast): Observable<any> {
    return this.ble.startNotification(device.sensorUUID, this.service, this.receiveCharacteristic);
  }

  private stopReceiveData(device: DeviceSafeCast) {
    return this.ble.stopNotification(device.sensorUUID, this.service, this.receiveCharacteristic);
  }

  private decodeDataPackage(buffers: ArrayBuffer[]): Step | null {
    const data = buffers
      .map(buffer => new TextDecoder('utf8').decode(buffer))
      .join('')
      .split(',');
    return {
      ts: Date.now(),
      hitsNumber: Number(data[4])
    };
  }
}
