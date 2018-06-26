import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Platform } from '@ionic/angular';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { merge, Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { timer } from 'rxjs/internal/observable/timer';
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
import { DeviceType, RawDevice } from './abstract-device';
import { Device, DeviceOGKit } from './device';
import { DeviceOGKitService } from './device-og-kit.service';
import { ConnectionLost, DevicesDiscovered, StopDiscoverDevices } from './devices.action';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  private serviceUUIDs = [DeviceOGKitService.serviceUUID];

  private isScanning = false;
  constructor(
    private ble: BLE,
    private platform: Platform,
    private actions$: Actions,
    private store: Store,
    private deviceOGKitService: DeviceOGKitService
  ) {
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
            .sort((a, b) => b.rssi - a.rssi)
            .map(rawDevice => {
              switch (rawDevice.name) {
                case DeviceType.OGKIT:
                  return new DeviceOGKit(rawDevice);
                default:
                  return null;
              }
            })
            .filter((device): device is Device => device !== null)
        )
      )
      .subscribe(devices => this.store.dispatch(new DevicesDiscovered(devices)));
  }

  connectDevice(device: Device): Observable<any> {
    const connection = this.ble.connect(device.sensorUUID).pipe(shareReplay());
    connection.pipe(catchError(() => this.store.dispatch(new ConnectionLost()))).subscribe();
    return connection.pipe(take(1));
  }

  disconnectDevice(device: Device): Observable<any> {
    return fromPromise(this.ble.disconnect(device.sensorUUID));
  }

  getDeviceInfo(device: Device): Observable<Partial<Device>> {
    switch (device.apparatusVersion) {
      case DeviceType.OGKIT:
        return this.deviceOGKitService.getDeviceInfo(device);
    }
  }
}
