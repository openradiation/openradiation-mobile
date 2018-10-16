import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionDispatched, ofActionSuccessful, Store } from '@ngxs/store';
import { merge, Observable, of, timer } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import {
  buffer,
  catchError,
  concatMap,
  map,
  scan,
  shareReplay,
  skip,
  switchMap,
  take,
  takeUntil,
  tap,
  throttleTime
} from 'rxjs/operators';
import { AbstractDevice, DeviceType, RawDevice } from './abstract-device';
import { DeviceAtomTag } from './device-atom-tag';
import { DeviceAtomTagService } from './device-atom-tag.service';
import { DeviceOGKit } from './device-og-kit';
import { DeviceOGKitService } from './device-og-kit.service';
import { DeviceSafeCastService } from './device-safe-cast.service';
import {
  BLEConnectionLost,
  DeviceConnectionLost,
  DevicesDiscovered,
  StartDiscoverDevices,
  StopDiscoverDevices
} from './devices.action';
import { DeviceSafeCast } from './device-safe-cast';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  private currentAlert?: any;
  private scanDuration = 3;
  private scanPeriod = 5000;

  constructor(
    private ble: BLE,
    private platform: Platform,
    private actions$: Actions,
    private store: Store,
    private diagnostic: Diagnostic,
    private alertController: AlertController,
    private deviceOGKitService: DeviceOGKitService,
    private deviceAtomTagService: DeviceAtomTagService,
    private deviceSafeCastService: DeviceSafeCastService,
    private toastController: ToastController,
    private translateService: TranslateService
  ) {
    this.actions$.pipe(ofActionDispatched(StartDiscoverDevices)).subscribe(() => {
      if (this.currentAlert) {
        this.currentAlert.dismiss();
        this.currentAlert = undefined;
      }
    });
    this.actions$.pipe(ofActionSuccessful(DeviceConnectionLost)).subscribe(() =>
      this.toastController
        .create({
          message: this.translateService.instant('SENSORS.CONNECTION_LOST'),
          showCloseButton: true,
          duration: 3000,
          closeButtonText: this.translateService.instant('GENERAL.OK')
        })
        .then(toast => toast.present())
    );
  }

  startDiscoverDevices(): Observable<any> {
    return fromPromise(
      this.ble
        .isEnabled()
        .catch(err => {
          if (this.platform.is('android')) {
            return this.ble.enable();
          } else {
            throw err;
          }
        })
        .catch(err => {
          this.onBLEError();
          throw err;
        })
    ).pipe(tap(() => this.discoverDevices()));
  }

  private discoverDevices() {
    this.diagnostic.registerBluetoothStateChangeHandler((state: string) => {
      switch (state) {
        case this.diagnostic.bluetoothState.POWERED_OFF:
          this.onBLEError();
          this.store.dispatch(new BLEConnectionLost());
          break;
      }
    });
    const time = timer(this.scanPeriod, this.scanPeriod).pipe(
      takeUntil(this.actions$.pipe(ofActionSuccessful(StopDiscoverDevices, BLEConnectionLost)))
    );
    merge(
      this.ble.scan([], this.scanDuration).pipe(
        scan<RawDevice>((devices, newDevice) => [...devices, newDevice], []),
        throttleTime(100)
      ),
      time.pipe(
        switchMap(() => this.ble.scan([], this.scanDuration)),
        buffer(time),
        skip(1)
      )
    )
      .pipe(
        map((rawDevices: RawDevice[]) => {
          const res: RawDevice[] = [];
          rawDevices.forEach(rawDevice => {
            if (!res.find(rawDevice2 => rawDevice2.id === rawDevice.id)) {
              res.push(rawDevice);
            }
          });
          return res;
        }),
        map((rawDevices: RawDevice[]) =>
          rawDevices
            .sort((a, b) => b.rssi - a.rssi)
            .map<AbstractDevice | null>(rawDevice => {
              if (rawDevice.name) {
                if (rawDevice.name.includes(DeviceType.OGKit)) {
                  return new DeviceOGKit(rawDevice);
                } else if (rawDevice.name.includes(DeviceType.AtomTag)) {
                  return new DeviceAtomTag(rawDevice);
                }
              }
              return null;
            })
            .filter((device): device is AbstractDevice => device !== null)
        )
      )
      .subscribe(devices => this.store.dispatch(new DevicesDiscovered(devices)));
  }

  connectDevice(device: AbstractDevice): Observable<any> {
    const connection = this.ble.connect(device.sensorUUID).pipe(
      concatMap(() => this.saveDeviceParams(device)),
      shareReplay()
    );
    connection.pipe(catchError(() => this.store.dispatch(new DeviceConnectionLost()))).subscribe();
    return connection.pipe(take(1));
  }

  disconnectDevice(device: AbstractDevice): Observable<any> {
    return fromPromise(this.ble.disconnect(device.sensorUUID));
  }

  getDeviceInfo(device: AbstractDevice): Observable<Partial<AbstractDevice>> {
    switch (device.deviceType) {
      case DeviceType.OGKit:
        return this.deviceOGKitService.getDeviceInfo(<DeviceOGKit>device);
      case DeviceType.AtomTag:
        return this.deviceAtomTagService.getDeviceInfo(<DeviceAtomTag>device);
      case DeviceType.SafeCast:
        return this.deviceSafeCastService.getDeviceInfo(<DeviceSafeCast>device);
    }
  }

  saveDeviceParams(device: AbstractDevice): Observable<any> {
    switch (device.deviceType) {
      case DeviceType.OGKit:
        return this.deviceOGKitService.saveDeviceParams(<DeviceOGKit>device);
      case DeviceType.AtomTag:
        return this.deviceAtomTagService.saveDeviceParams(<DeviceAtomTag>device);
      case DeviceType.SafeCast:
        return of();
    }
  }

  private onBLEError() {
    this.diagnostic.registerBluetoothStateChangeHandler(() => {
      this.store.dispatch(new StartDiscoverDevices()).subscribe();
      this.diagnostic.registerBluetoothStateChangeHandler(() => {});
    });
    this.alertController
      .create({
        header: this.translateService.instant('BLUETOOTH.BLE_DISABLED.TITLE'),
        message: this.translateService.instant('BLUETOOTH.BLE_DISABLED.NOTICE'),
        backdropDismiss: false,
        buttons: [
          {
            text: this.translateService.instant('GENERAL.GO_TO_SETTINGS'),
            handler: () => {
              if (this.platform.is('ios')) {
                this.diagnostic.switchToSettings();
              } else {
                this.diagnostic.switchToBluetoothSettings();
              }
              return false;
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
