import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin, Observable, of, zip, from } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { Step } from '@app/states/measures/measure';
import { DeviceConnectionLost } from '@app/states/devices/devices.action';
import { RawBLEDevice } from './abstract-ble-device';
import { AbstractBLEDeviceService } from './abstract-ble-device.service';
import { DeviceRium2BLE } from './device-rium-2-ble';
import { BleClient } from '@capacitor-community/bluetooth-le';
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

  constructor(protected store: Store) {
    super(store);
  }

  getDeviceInfo(device: DeviceRium2BLE): Observable<Partial<DeviceRium2BLE>> {
    return forkJoin(
      [from(BleClient.read(device.sensorUUID, this.service, this.idCharacteristic)),
      this.startNotificationsRx(device, this.batteryCharacteristic).pipe(
        take(1),
        tap(() => BleClient.stopNotifications(device.sensorUUID, this.service, this.batteryCharacteristic))
      )]
    ).pipe(
      map(([idDataView, batteryDataView]: [DataView, DataView]) => {
        const apparatusId = this.arrayBufferToHex(idDataView.buffer);
        const batteryVoltage = this.getNumberFromBuffer(batteryDataView.buffer, 3) / 100;
        const batteryLevel = Math.max(0, Math.min(100, 227.27 * batteryVoltage - 840.9));
        return {
          apparatusId,
          batteryLevel
        };
      })
    );
  }

  saveDeviceParams(_device: DeviceRium2BLE): Observable<unknown> {
    return of(null);
  }

  startMeasureScan(device: DeviceRium2BLE, stopSignal: Observable<unknown>): Observable<Step> {
    stopSignal.subscribe(() => {
      this.stopReceiveData(device);
      BleClient.stopNotifications(device.sensorUUID, this.service, this.temperatureCharacteristic);
    });
    return zip(
      this.startReceiveData(device),
      this.startNotificationsRx(device, this.temperatureCharacteristic)
    ).pipe(
      map((dataViews: [DataView, DataView]) => {
        const buffers: [ArrayBuffer, ArrayBuffer] = [dataViews[0].buffer, dataViews[1].buffer]
        return this.decodeDataPackage(buffers)
      }),
      catchError(err => {
        this.disconnectDevice(device).subscribe();
        setTimeout(() => this.store.dispatch(new DeviceConnectionLost()), 1000);
        throw err;
      })
    );
  }

  protected decodeDataPackage([hitsBuffer, temperatureBuffer]: [ArrayBuffer, ArrayBuffer]): Step {
    const hitsNumber = this.getNumberFromBuffer(hitsBuffer, 2);
    const temperature = this.getNumberFromBuffer(temperatureBuffer, 3) / 10;
    return {
      ts: Date.now(),
      hitsNumber,
      temperature
    };
  }

  buildDevice(rawBLEDevice: RawBLEDevice): DeviceRium2BLE | null {
    if (rawBLEDevice.name.includes('ICOHUP_GMBLE')) {
      return new DeviceRium2BLE(rawBLEDevice);
    }
    return null;
  }

  private getNumberFromBuffer(buffer: ArrayBuffer, size: number): number {
    return parseInt(this.arrayBufferToHex(buffer).slice(0, size), 16);
  }
}
