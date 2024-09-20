import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { bufferCount, filter, map, tap } from 'rxjs/operators';
import { Step } from '@app/states/measures/measure';
import { RawBLEDevice } from './abstract-ble-device';
import { AbstractBLEDeviceService } from './abstract-ble-device.service';
import { DeviceSafeCast, DeviceSafeCastType } from './device-safe-cast';

@Injectable({
  providedIn: 'root'
})
export class DeviceSafeCastService extends AbstractBLEDeviceService<DeviceSafeCast> {
  protected calibrationFunctions = {
    planeMode: {
      0: 'cps / 5.56667',
      4.33: 'cps * 0.42'
    },
    groundLevel: {
      0: 'cps / 5.56667'
    }
  };

  protected service = 'ef080d8c-c3be-41ff-bd3f-05a5f4795d7f';
  protected receiveCharacteristic = 'a1e8f5b1-696b-4e4c-87c6-69dfe0b0093b';

  constructor(protected store: Store) {
    super(store);
  }

  getDeviceInfo(_device: DeviceSafeCast): Observable<Partial<DeviceSafeCast>> {
    return of({});
  }

  saveDeviceParams(_device: DeviceSafeCast): Observable<unknown> {
    return of(null);
  }

  startMeasureScan(device: DeviceSafeCast, stopSignal: Observable<unknown>): Observable<Step> {
    stopSignal.subscribe(() => this.stopReceiveData(device));
    let readingBufferSequence = false;
    return this.startReceiveData(device).pipe(
      filter((dataView: DataView) => {
        return dataView.getUint8(0) === 36 || readingBufferSequence;
      }),
      tap(() => (readingBufferSequence = true)),
      bufferCount(18),
      tap(() => (readingBufferSequence = false)),
      map(dataViews => this.decodeDataPackage(dataViews))
    );
  }

  protected decodeDataPackage(dataViews: DataView[]): Step {
    const data = dataViews
      .map(dataView => this.textDecoder.decode(dataView.buffer))
      .join('')
      .split(',');
    const receiveData = {
      ts: Date.now(),
      hitsNumber: Number(data[4])
    };
    this.logAndStore("Received from SafeCast : " + JSON.stringify(receiveData))
    return receiveData
  }

  buildDevice(rawBLEDevice: RawBLEDevice): DeviceSafeCast | null {
    if (
      rawBLEDevice.name.includes(DeviceSafeCastType.BGeigieBLE) ||
      rawBLEDevice.name.startsWith(DeviceSafeCastType.BLEBee)
    ) {
      return new DeviceSafeCast(rawBLEDevice);
    }
    return null;
  }
}
