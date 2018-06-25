import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { BLE } from '@ionic-native/ble/ngx';
import {
  buffer,
  catchError,
  map,
  scan,
  shareReplay,
  skip,
  switchMap,
  take,
  takeWhile,
  tap,
  throttleTime
} from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { fromPromise } from 'rxjs/internal-compatibility';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { ConnectionLost, DevicesDiscovered, StopDiscoverDevices } from './devices.action';
import { Device, RawDevice } from './device';
import { timer } from 'rxjs/internal/observable/timer';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  private serviceUUIDs = ['00002220-0000-1000-8000-00805F9B34FB'];

  private isScanning = false;
  constructor(private ble: BLE, private platform: Platform, private actions$: Actions, private store: Store) {
    this.actions$.pipe(ofActionSuccessful(StopDiscoverDevices)).subscribe(() => (this.isScanning = false));
  }

  startDiscoverDevices(): Observable<any> {
    return fromPromise(
      this.ble.isEnabled().catch(err => {
        if (this.platform.is('android')) {
          return this.ble.enable();
        } else {
          throw err;
        }
      })
    ).pipe(
      tap(() => {
        this.isScanning = true;
        this.discoverDevices();
      })
    );
  }

  discoverDevices() {
    const time = timer(5000, 5000).pipe(takeWhile(() => this.isScanning));
    merge(
      this.ble.scan(this.serviceUUIDs, 3).pipe(
        scan<RawDevice>((devices, newDevice) => [...devices, newDevice], []),
        throttleTime(100)
      ),
      time.pipe(
        switchMap(() => this.ble.scan(this.serviceUUIDs, 3)),
        buffer(time),
        skip(1)
      )
    )
      .pipe(
        map((rawDevices: RawDevice[]) =>
          rawDevices
            .filter(rawDevice => rawDevice.name !== undefined)
            .sort((a, b) => b.rssi - a.rssi)
            .map(rawDevice => {
              return new Device(rawDevice.id, this.parseAdvertising(rawDevice.advertising), rawDevice.name);
            })
        )
      )
      .subscribe((devices: Device[]) => this.store.dispatch(new DevicesDiscovered(devices)));
  }

  private parseAdvertising(advertising: any): any {
    if (this.platform.is('android')) {
      const manufacturerData = new Uint8Array(advertising).slice(21);
      return new TextDecoder('utf8').decode(manufacturerData);
    } else {
      return advertising;
    }
  }

  connectDevice(device: Device): Observable<any> {
    const connection = this.ble.connect(device.sensorUUID).pipe(shareReplay());
    connection.pipe(catchError(() => this.store.dispatch(new ConnectionLost()))).subscribe();
    return connection.pipe(take(1));
  }

  disconnectDevice(device: Device): Observable<any> {
    return fromPromise(this.ble.disconnect(device.sensorUUID));
  }
}
