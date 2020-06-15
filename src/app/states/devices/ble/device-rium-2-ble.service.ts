import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Store } from '@ngxs/store';
import { forkJoin, Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { catchError, map, take, tap } from 'rxjs/operators';
import { Step } from '../../measures/measure';
import { DeviceConnectionLost } from '../devices.action';
import { RawBLEDevice } from './abstract-ble-device';
import { AbstractBLEDeviceService } from './abstract-ble-device.service';
import { DeviceRium2BLE } from './device-rium-2-ble';

@Injectable({
  providedIn: 'root'
})
export class DeviceRium2BLEService extends AbstractBLEDeviceService<DeviceRium2BLE> {
  protected calibrationFunctions = {
    planeMode: {
      0: '(0.00000003751 * (cps * 60 - 4) ^ 2 + 0.00965 * (cps * 60 - 4)) * 0.85',
      1.5: 'cps * 1.14'
    },
    groundLevel: {
      0: '(0.00000003751 * (cps * 60 - 4) ^ 2 + 0.00965 * (cps * 60 - 4)) * 0.85'
    }
  };

  protected service = 'FFD3A53C-653F-11EA-BC55-0242AC130003';
  protected receiveCharacteristic = '644825CA-653F-11EA-BC55-0242AC130003';
  private temperatureCharacteristic = 'B3F78624-653F-11EA-BC55-0242AC130003';
  private batteryCharacteristic = '1726218E-76b0-11EA-BC55-0242AC130003';
  private idCharacteristic = '90B4A556-7427-11EA-BC55-0242AC130003';

  constructor(protected store: Store, protected ble: BLE) {
    super(store, ble);
  }

  getDeviceInfo(device: DeviceRium2BLE): Observable<Partial<DeviceRium2BLE>> {
    return forkJoin(
      fromPromise(this.ble.read(device.sensorUUID, this.service, this.idCharacteristic)),
      this.ble.startNotification(device.sensorUUID, this.service, this.batteryCharacteristic).pipe(
        take(1),
        tap(() => this.ble.stopNotification(device.sensorUUID, this.service, this.batteryCharacteristic))
      )
    ).pipe(
      map(([idBuffer, batteryBuffer]: [ArrayBuffer, ArrayBuffer]) => {
        const apparatusId = this.arrayBufferToHex(idBuffer);
        const batteryLevel = Number(this.arrayBufferToHex(batteryBuffer).slice(0, 3)) / 100;
        return {
          apparatusId,
          batteryLevel
        };
      })
    );
  }

  saveDeviceParams(device: DeviceRium2BLE): Observable<any> {
    return of(null);
  }

  startMeasureScan(device: DeviceRium2BLE, stopSignal: Observable<any>): Observable<Step> {
    stopSignal.subscribe(() => this.stopReceiveData(device));
    return this.startReceiveData(device).pipe(
      map((buffer: ArrayBuffer) => this.decodeDataPackage(buffer)),
      catchError(err => {
        this.disconnectDevice(device).subscribe();
        setTimeout(() => this.store.dispatch(new DeviceConnectionLost()), 1000);
        throw err;
      })
    ); // TODO temp
  }

  protected decodeDataPackage(buffer: ArrayBuffer): Step {
    const dataView = new DataView(buffer);
    return {
      ts: Date.now(),
      hitsNumber: dataView.getInt8(0)
    };
  }

  buildDevice(rawBLEDevice: RawBLEDevice): DeviceRium2BLE | null {
    if (rawBLEDevice.name.includes('ICOHUP_GMBLE')) {
      return new DeviceRium2BLE(rawBLEDevice);
    }
    return null;
  }
}
