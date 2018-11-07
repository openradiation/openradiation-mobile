import { Injectable } from '@angular/core';
import { Serial } from '@ionic-native/serial/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { tap } from 'rxjs/operators';
import { StartDiscoverUSBDevices, USBDevicesDiscovered } from '../devices.action';
import { DevicePocketGeiger } from './device-pocket-geiger';

@Injectable({
  providedIn: 'root'
})
export class USBDevicesService {
  private currentAlert?: any;

  constructor(
    private serial: Serial,
    private store: Store,
    private translateService: TranslateService,
    private alertController: AlertController,
    private platform: Platform,
    private actions$: Actions
  ) {
    this.actions$.pipe(ofActionDispatched(StartDiscoverUSBDevices)).subscribe(() => {
      if (this.currentAlert) {
        this.currentAlert.dismiss();
        this.currentAlert = undefined;
      }
    });
  }

  startDiscoverDevices(): Observable<any> {
    const device = new DevicePocketGeiger();
    return fromPromise(
      this.serial.requestPermission({ vid: device.vid, pid: device.pid, driver: device.driver }).catch(err => {
        this.onUSBError();
        throw err;
      })
    ).pipe(tap(() => this.store.dispatch(new USBDevicesDiscovered([device]))));
  }

  private onUSBError() {
    this.alertController
      .create({
        header: this.translateService.instant('USB.USB_PERMISSION.TITLE'),
        message: this.translateService.instant('USB.USB_PERMISSION.NOTICE'),
        backdropDismiss: false,
        buttons: [
          {
            text: this.translateService.instant('GENERAL.OK'),
            handler: () => {
              this.store.dispatch(new StartDiscoverUSBDevices());
              return true;
            }
          }
        ]
      })
      .then(alert => {
        this.currentAlert = alert;
        alert.present();
      });
  }
}
