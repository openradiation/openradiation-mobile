import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { UsbSerial } from 'cordova-plugin-usb-serial';
import { Observable, of } from 'rxjs';
import { AlertService } from '@app/services/alert.service';
import { AbstractDevice, DeviceType } from '@app/states/devices/abstract-device';
import { StartDiscoverUSBDevices, StopDiscoverDevices, USBDevicesDiscovered } from '@app/states/devices/devices.action';
import { DevicesService } from '@app/states/devices/devices.service';
import { AbstractUSBDevice } from './abstract-usb-device';
import { Capacitor } from '@capacitor/core';

/**
 * Constant from cordova-plugin-usb-serial
 */
declare const UsbSerial: UsbSerial;

@Injectable({
  providedIn: 'root'
})
export class USBDevicesService {
  private devices = [DeviceType.PocketGeiger, DeviceType.Rium2USB]; // Only the 2nd version of Rium is present here, but it will be used to detect old version of Rium too

  private currentAlert?: HTMLIonAlertElement;

  constructor(
    private store: Store,
    private translateService: TranslateService,
    private alertService: AlertService,
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
      if (Capacitor.getPlatform() != 'web') {
        UsbSerial.onDeviceAttached([], null);
      }
    });
  }

  startDiscoverDevices(): Observable<unknown> {
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
