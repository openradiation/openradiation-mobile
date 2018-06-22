import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { BLE } from '@ionic-native/ble/ngx';
import { bufferTime, map, scan, switchMap, takeWhile, tap, throttleTime } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { fromPromise } from 'rxjs/internal-compatibility';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { DevicesDiscovered, StopDiscoverDevices } from './devices.action';
import { Device, RawDevice } from './device';
import { timer } from 'rxjs/internal/observable/timer';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
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
    merge(
      this.ble.scan([], 2).pipe(
        scan<RawDevice>((devices, newDevice) => [...devices, newDevice], []),
        throttleTime(100)
      ),
      timer(2500, 2500).pipe(switchMap(() => this.ble.scan([], 2).pipe(bufferTime(2000))))
    )
      .pipe(
        map((rawDevices: RawDevice[]) =>
          rawDevices.map(
            rawDevice => new Device(rawDevice.id, this.parseAdvertising(rawDevice.advertising), rawDevice.name)
          )
        ),
        takeWhile(() => this.isScanning)
      )
      .subscribe((devices: Device[]) => this.store.dispatch(new DevicesDiscovered(devices)));
  }

  private parseAdvertising(advertising: any): any {
    if (this.platform.is('android')) {
      return new Uint8Array(advertising);
    } else {
      return advertising;
    }
  }
}
