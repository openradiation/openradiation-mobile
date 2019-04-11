import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { UsbSerial } from 'cordova-plugin-usb-serial';
import { Observable, of } from 'rxjs';
import { AlertService } from '../../../services/alert.service';
import { AbstractDevice, DeviceType } from '../abstract-device';
import { StartDiscoverUSBDevices, StopDiscoverDevices, USBDevicesDiscovered } from '../devices.action';
import { DevicesService } from '../devices.service';
import { AbstractUSBDevice } from './abstract-usb-device';

/**
 * Constant from cordova-plugin-usb-serial
 */
declare const UsbSerial: UsbSerial;

@Injectable({
  providedIn: 'root'
})
export class USBDevicesService {
  private devices = [DeviceType.PocketGeiger, DeviceType.Rium];

  private currentAlert?: any;

  constructor(
    private store: Store,
    private translateService: TranslateService,
    private alertService: AlertService,
    private platform: Platform,
    private actions$: Actions,
    private devicesService: DevicesService
  ) {
    this.actions$.pipe(ofActionDispatched(StartDiscoverUSBDevices)).subscribe(() => {
      if (this.currentAlert) {
        this.currentAlert.dismiss();
        this.currentAlert = undefined;
      }
    });
    this.actions$.pipe(ofActionDispatched(StopDiscoverDevices)).subscribe(() => {
      UsbSerial.onDeviceAttached([], null);
    });
  }

  startDiscoverDevices(): Observable<any> {
    this.discoverDevices();
    return of(null);
  }

  private discoverDevices() {
    const whiteList = this.devices
      .map(deviceType => this.devicesService.buildDevice(deviceType))
      .filter((device: AbstractDevice | null): device is AbstractUSBDevice => device !== null);
    UsbSerial.onDeviceAttached(whiteList, devicesAttached => {
      const devices = whiteList.filter(whiteListDevice =>
        devicesAttached.find(
          deviceAttached => whiteListDevice.vid === deviceAttached.vid && whiteListDevice.pid === deviceAttached.pid
        )
      );
      this.store.dispatch(new USBDevicesDiscovered(devices));
    });
  }
}
