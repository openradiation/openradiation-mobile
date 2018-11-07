import { Injectable } from '@angular/core';
import { Serial } from '@ionic-native/serial/ngx';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { USBDevicesDiscovered } from '../devices.action';
import { DevicePocketGeiger } from './device-pocket-geiger';

@Injectable({
  providedIn: 'root'
})
export class USBDevicesService {
  constructor(private serial: Serial, private store: Store) {}

  startDiscoverDevices(): Observable<any> {
    const device = new DevicePocketGeiger();
    fromPromise(this.serial.requestPermission({ vid: device.vid, pid: device.pid, driver: device.driver })).subscribe(
      () => this.store.dispatch(new USBDevicesDiscovered([device]))
    );
    return of(null);
  }
}
