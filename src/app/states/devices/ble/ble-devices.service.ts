import { Injectable } from '@angular/core';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionDispatched, ofActionSuccessful, Store } from '@ngxs/store';
import { merge, Observable, timer, from } from 'rxjs';
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
import { BleClient } from '@capacitor-community/bluetooth-le';

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
    private platform: Platform,
    private actions$: Actions,
    private store: Store,
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
    return from(
      BleClient
        .isEnabled()
        .catch(err => {
          if (this.platform.is('android')) {
            return BleClient.requestEnable();
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
    Diagnostic.registerBluetoothStateChangeHandler((state: string) => {
      switch (state) {
        case Diagnostic.bluetoothState.POWERED_OFF:
          this.onBLEError();
          this.store.dispatch(new BLEConnectionLost());
          break;
      }
    });
    const time = timer(this.scanPeriod, this.scanPeriod).pipe(
      takeUntil(this.actions$.pipe(ofActionSuccessful(StopDiscoverDevices, BLEConnectionLost)))
    );
    merge(
      this.scan(this.scanDuration).pipe(
        scan<RawBLEDevice, RawBLEDevice[]>(
          (devices: RawBLEDevice[], newDevice: RawBLEDevice) => [...devices, newDevice],
          []
        ),
        throttleTime(100)
      ),
      time.pipe(
        switchMap(() => this.scan(this.scanDuration)),
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
    Diagnostic.registerBluetoothStateChangeHandler(() => {
      this.store.dispatch(new StartDiscoverBLEDevices()).subscribe();
      Diagnostic.registerBluetoothStateChangeHandler(() => { });
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
                  Diagnostic.switchToSettings();
                } else {
                  Diagnostic.switchToBluetoothSettings();
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


  private scan(_scanDuration: number): Observable<any> {
    // FIXME : parameter "scanDuration" cannot be passed to new capacitor BLE API
    return new Observable(observer => {
      BleClient.requestLEScan({},
        (scanResult) => (observer.next(scanResult))
      ).catch(e => observer.error(e));
    });
  }
}
