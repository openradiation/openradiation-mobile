import { Injectable } from '@angular/core';
import { Device } from './device';
import { Observable } from 'rxjs';
import { BLE } from '@ionic-native/ble/ngx';
import { concatMap, mapTo, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  constructor(private ble: BLE) {}

  discoverDevices(): Observable<Device[]> {
    return fromPromise(this.ble.isEnabled().catch(() => this.ble.enable())).pipe(
      concatMap(() => this.ble.startScan([])),
      tap(console.log),
      mapTo([])
    );
  }
}
