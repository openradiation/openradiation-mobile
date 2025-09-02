import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin, Observable, of, zip, from } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { Step } from '@app/states/measures/measure';
import { RawBLEDevice } from './abstract-ble-device';
import { AbstractBLEDeviceService } from './abstract-ble-device.service';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { DeviceBertinRadConnectBLE } from './device-bertin-rad-connect-ble';
import { DeviceConnectionLost } from '../devices.action';
import { DeviceType } from '../abstract-device';

@Injectable({
  providedIn: 'root',
})
export class DeviceBertinRadConnectBLEService extends AbstractBLEDeviceService<DeviceBertinRadConnectBLE> {
  // TODO Bertin adapt calibration functions
  protected calibrationFunctions = {
    planeMode: {
      0: 'cps / 5.56667',
      4.33: 'cps * 0.42',
    },
    groundLevel: {
      0: 'cps / 5.56667',
    },
  };

  protected service = '460AC7FF-78B9-26B2-5943-4F04311FD43C';
  protected sensorIdentificationCharacteristic = '63209D5C-26E0-36B2-9047-675528A8CDFE';
  protected receiveCharacteristic = '2BB349C6-0278-949D-2841-F55C22842E2F';
  private sendCharacteristic = '82ba1887-0815-61a5-be42-6192013fd390';
  // TODO Bertin : use this to synchronize data after connection loss
  private retrieveInMemoryMeasuresCharacteristic = 'c6f9e64f-08da-4ab7-974e-229f6cc41d74';
  private bluetoothAcknowledgmentCharacteristic =
    'UUID : 5a5921ac5f6d4e64a121d06914753876 76387514-69D0-21A1-644E-6D5FAC21595A';

  constructor(protected store: Store) {
    super(store);
  }

  getDeviceInfo(device: DeviceBertinRadConnectBLE): Observable<Partial<DeviceBertinRadConnectBLE>> {
    return forkJoin([
      from(BleClient.read(device.sensorUUID, this.service, this.sensorIdentificationCharacteristic)),
    ]).pipe(
      map(([idDataView]: [DataView]) => {
        const toHex = this.arrayBufferToHex(idDataView.buffer);
        const family = parseInt(toHex.slice(1, 2), 8);
        const variant = parseInt(toHex.slice(2, 3), 8);
        const increment = parseInt(toHex.slice(2, 7), 32);
        const firmwareVersion = family + '.' + variant + '.' + increment;
        return {
          apparatusVersion: `${DeviceType.BertinRadConnect} v${firmwareVersion}`,
        };
      }),
    );
  }

  saveDeviceParams(_device: DeviceBertinRadConnectBLE): Observable<unknown> {
    return of(null);
  }

  startMeasureScan(device: DeviceBertinRadConnectBLE, stopSignal: Observable<unknown>): Observable<Step> {
    stopSignal.subscribe(() => {
      this.stopReceiveData(device);
    });
    return zip(this.startReceiveData(device)).pipe(
      map((dataViews: [DataView]) => {
        return this.decodeDataPackage(dataViews);
      }),
      catchError((err) => {
        this.disconnectDevice(device).subscribe();
        setTimeout(() => this.store.dispatch(new DeviceConnectionLost()), 1000);
        throw err;
      }),
    );
  }

  protected decodeDataPackage([hitsBuffer]: [DataView]): Step {
    const hitsNumber = this.getNumberFromBuffer(hitsBuffer.buffer, 2);
    const receiveData = {
      ts: Date.now(),
      hitsNumber,
    };
    this.logAndStore('Received from RadConnectBLE : ' + JSON.stringify(receiveData));
    return receiveData;
  }

  private getNumberFromBuffer(buffer: ArrayBuffer, size: number): number {
    return parseInt(this.arrayBufferToHex(buffer).slice(0, size), 16);
  }

  buildDevice(rawBLEDevice: RawBLEDevice): DeviceBertinRadConnectBLE | null {
    if (rawBLEDevice.name.includes('RadConnect_GP')) {
      return new DeviceBertinRadConnectBLE(rawBLEDevice);
    }
    return null;
  }
}
