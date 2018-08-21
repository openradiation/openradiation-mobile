import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { Actions, ofActionDispatched, ofActionSuccessful, Store } from '@ngxs/store';
import { merge, Observable, timer } from 'rxjs';
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
import { DeviceType, RawDevice } from './abstract-device';
import { Device, DeviceAtomTag, DeviceOGKit } from './device';
import { DeviceOGKitService } from './device-og-kit.service';
import {
  BLEConnectionLost,
  DeviceConnectionLost,
  DevicesDiscovered,
  StartDiscoverDevices,
  StopDiscoverDevices
} from './devices.action';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { DeviceAtomTagService } from './device-atom-tag.service';

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
    private toastController: ToastController
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
          message: 'Connexion avec le capteur perdue',
          showCloseButton: true,
          duration: 3000,
          closeButtonText: 'OK'
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
        map((rawDevices: RawDevice[]) =>
          rawDevices
            .sort((a, b) => b.rssi - a.rssi)
            .map(rawDevice => {
              if (rawDevice.name) {
                if (rawDevice.name.includes(DeviceType.OGKit)) {
                  return new DeviceOGKit(rawDevice);
                } else if (rawDevice.name.includes(DeviceType.AtomTag)) {
                  return new DeviceAtomTag(rawDevice);
                }
              }
              return null;
            })
            .filter((device): device is Device => device !== null)
        )
      )
      .subscribe(devices => this.store.dispatch(new DevicesDiscovered(devices)));
  }

  connectDevice(device: Device): Observable<any> {
    const connection = this.ble.connect(device.sensorUUID).pipe(
      tap(console.log),
      concatMap(() => this.saveDeviceParams(device)),
      shareReplay()
    );
    connection.pipe(catchError(() => this.store.dispatch(new DeviceConnectionLost()))).subscribe();
    return connection.pipe(take(1));
  }

  disconnectDevice(device: Device): Observable<any> {
    return fromPromise(this.ble.disconnect(device.sensorUUID));
  }

  getDeviceInfo(device: Device): Observable<Partial<Device>> {
    switch (device.deviceType) {
      case DeviceType.OGKit:
        return this.deviceOGKitService.getDeviceInfo(<DeviceOGKit>device);
      case DeviceType.AtomTag:
        return this.deviceAtomTagService.getDeviceInfo(<DeviceAtomTag>device);
    }
  }

  saveDeviceParams(device: Device): Observable<any> {
    switch (device.deviceType) {
      case DeviceType.OGKit:
        return this.deviceOGKitService.saveDeviceParams(<DeviceOGKit>device);
      case DeviceType.AtomTag:
        return this.deviceAtomTagService.saveDeviceParams(<DeviceAtomTag>device);
    }
  }

  private onBLEError() {
    this.diagnostic.registerBluetoothStateChangeHandler(() => {
      this.store.dispatch(new StartDiscoverDevices()).subscribe();
      this.diagnostic.registerBluetoothStateChangeHandler(() => {});
    });
    this.alertController
      .create({
        header: 'Bluetooth désactivé',
        message: `Le bluetooth est nécessaire pour la communication avec les capteurs. Merci de l'activer.`,
        backdropDismiss: false,
        buttons: [
          {
            text: 'Accéder aux paramètres',
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
