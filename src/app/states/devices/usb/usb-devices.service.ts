import { Injectable } from '@angular/core';
import { Serial } from '@ionic-native/serial/ngx';
import { Observable, of } from 'rxjs';

@Injectable()
export class USBDevicesService {
  constructor(private serial: Serial) {}

  startDiscoverDevices(): Observable<any> {
    return of(null);
  }
}
