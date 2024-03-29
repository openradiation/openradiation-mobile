import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionDispatched, ofActionSuccessful, Store } from '@ngxs/store';
import { merge, Observable, timer } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { buffer, map, scan, skip, switchMap, takeUntil, tap, throttleTime } from 'rxjs/operators';
import { AlertService } from '../../../services/alert.service';
import { AbstractDevice, DeviceType } from '../abstract-device';
import {
  BLEConnectionLost,
  BLEDevicesDiscovered,
  StartDiscoverBLEDevices,
  StopDiscoverDevices
} from '../devices.action';
import { DevicesService } from '../devices.service';
import { AbstractBLEDevice, RawBLEDevice } from './abstract-ble-device';

@Injectable({
  providedIn: 'root'
})
export class BLEDevicesService {
  private devices = [
    DeviceType.OGKit,
    DeviceType.OGKit2,
    DeviceType.AtomTag,
    DeviceType.SafeCast,
    DeviceType.Rium2BLE
  ];

  private currentAlert?: any;
  private scanDuration = 3;
  private scanPeriod = 5000;

  constructor(
    private ble: BLE,
    private platform: Platform,
    private actions$: Actions,
    private store: Store,
    private diagnostic: Diagnostic,
    private alertService: AlertService,
    private translateService: TranslateService,
    private devicesService: DevicesService
  ) {
    this.actions$.pipe(ofActionDispatched(StartDiscoverBLEDevices)).subscribe(() => {
      if (this.currentAlert) {
        this.currentAlert.dismiss();
        this.currentAlert = undefined;
      }
    });
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
        scan<RawBLEDevice>((devices, newDevice) => [...devices, newDevice], []),
        throttleTime(100)
      ),
      time.pipe(
        switchMap(() => this.ble.scan([], this.scanDuration)),
        buffer(time),
        skip(1)
      )
    )
      .pipe(
        map((rawDevices: RawBLEDevice[]) => {
          const res: RawBLEDevice[] = [];
          rawDevices.forEach(rawDevice => {
            if (!res.find(rawDevice2 => rawDevice2.id === rawDevice.id)) {
              res.push(rawDevice);
            }
          });
          return res;
        }),
        map((rawDevices: RawBLEDevice[]) =>
          rawDevices
            .sort((a, b) => b.rssi - a.rssi)
            .map<AbstractDevice | null>(
              rawDevice =>
                (rawDevice.name &&
                  this.devices
                    .map(deviceType => this.devicesService.buildDevice(deviceType, rawDevice))
                    .filter((device: AbstractDevice | null): device is AbstractBLEDevice => device !== null)[0]) ||
                null
            )
            .filter((device): device is AbstractDevice => device !== null)
        )
      )
      .subscribe(devices => this.store.dispatch(new BLEDevicesDiscovered(devices)));
  }

  private onBLEError() {
    this.diagnostic.registerBluetoothStateChangeHandler(() => {
      this.store.dispatch(new StartDiscoverBLEDevices()).subscribe();
      this.diagnostic.registerBluetoothStateChangeHandler(() => {});
    });
    this.alertService
      .show(
        {
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
        },
        false
      )
      .then(alert => (this.currentAlert = alert));
  }
}
