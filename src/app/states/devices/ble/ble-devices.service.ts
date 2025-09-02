import { Injectable } from '@angular/core';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionDispatched, ofActionSuccessful, Store } from '@ngxs/store';
import { merge, Observable, timer, from } from 'rxjs';
import { buffer, map, scan, skip, switchMap, takeUntil, tap, throttleTime } from 'rxjs/operators';
import { AlertService } from '@app/services/alert.service';
import { AbstractDevice, DeviceType } from '@app/states/devices/abstract-device';
import {
  BLEConnectionLost,
  BLEDevicesDiscovered,
  StartDiscoverBLEDevices,
  StopDiscoverDevices
} from '@app/states/devices/devices.action';
import { DevicesService } from '@app/states/devices/devices.service';
import { AbstractBLEDevice, RawBLEDevice } from './abstract-ble-device';
import { BleClient, ScanMode } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import { PositionService } from '@app/states/measures/position.service';
import { Platform } from '@ionic/angular';


@Injectable({
  providedIn: 'root',
})
export class BLEDevicesService {
  private devices = [
    DeviceType.OGKit,
    DeviceType.OGKit2,
    DeviceType.AtomTag,
    DeviceType.SafeCast,
    DeviceType.Rium2BLE,
    DeviceType.BertinRadConnect,
  ];

  private currentAlert?: HTMLIonAlertElement;
  private scanDuration = 3;
  private scanPeriod = 5000;
  private listeningPlatformResume = false;

  constructor(
    private platform: Platform,
    private actions$: Actions,
    private store: Store,
    private alertService: AlertService,
    private translateService: TranslateService,
    private devicesService: DevicesService,
    private positionService: PositionService,
  ) {
    this.actions$.pipe(ofActionDispatched(StartDiscoverBLEDevices)).subscribe(() => {
      if (this.currentAlert) {
        this.currentAlert.dismiss();
        this.currentAlert = undefined;
      }
    });
  }

  startDiscoverDevices(): Observable<unknown> {
    return from(
      this.enableLocationAndBluetooth()
        .then((bluetoothEnabled) => {
          if (!bluetoothEnabled) {
            throw new Error('Missing bluetooth or location permissions');
          }
        })
        .catch((error) => {
          console.error(error);
          this.onBLEError(true);
        }),
    ).pipe(tap(() => this.discoverDevices()));
  }

  private async enableLocationAndBluetooth(): Promise<boolean> {
    const hasLocationEnabled = await this.positionService.requestAuthorization();
    if (hasLocationEnabled) {
      try {
        await BleClient.initialize();
      } catch (error) {
        console.error('Error while initializing BleClient, probably missing permissions', error);
        this.onBLEError(true);
        return false;
      }
      const isBluetoothEnabled = await BleClient.isEnabled();

      if (!isBluetoothEnabled && Capacitor.getPlatform() == 'android') {
        await BleClient.requestEnable();
      } else if (!isBluetoothEnabled) {
        this.onBLEError(false);
      }
      return isBluetoothEnabled;
    }
    return false;
  }

  private discoverDevices() {
    Diagnostic.registerBluetoothStateChangeHandler((state: string) => {
      switch (state) {
        case Diagnostic.bluetoothState.POWERED_OFF:
          this.onBLEError(false);
          this.store.dispatch(new BLEConnectionLost());
          break;
      }
    });
    const time = timer(this.scanPeriod, this.scanPeriod).pipe(
      takeUntil(this.actions$.pipe(ofActionSuccessful(StopDiscoverDevices, BLEConnectionLost))),
    );
    merge(
      this.scan(this.scanDuration).pipe(
        scan<RawBLEDevice, RawBLEDevice[]>(
          (devices: RawBLEDevice[], newDevice: RawBLEDevice) => [...devices, newDevice],
          [],
        ),
        throttleTime(100),
      ),
      time.pipe(
        switchMap(() => this.scan(this.scanDuration)),
        buffer(time),
        skip(1),
      ),
    )
      .pipe(
        map((rawDevices: RawBLEDevice[]) => {
          const res: RawBLEDevice[] = [];
          rawDevices.forEach((rawDevice) => {
            if (!res.find((rawDevice2) => rawDevice2.id === rawDevice.id)) {
              res.push(rawDevice);
            }
          });
          return res;
        }),
        map((rawDevices: RawBLEDevice[]) =>
          rawDevices
            .sort((a, b) => b.rssi - a.rssi)
            .map<AbstractDevice | null>(
              (rawDevice) =>
                (rawDevice.name &&
                  this.devices
                    .map((deviceType) => this.devicesService.buildDevice(deviceType, rawDevice))
                    .filter((device: AbstractDevice | null): device is AbstractBLEDevice => device !== null)[0]) ||
                null,
            )
            .filter((device): device is AbstractDevice => device !== null),
        ),
      )
      .subscribe((devices) => this.store.dispatch(new BLEDevicesDiscovered(devices)));
  }

  private onBLEError(missingPermissions: boolean) {
    Diagnostic.registerBluetoothStateChangeHandler(() => {
      this.store.dispatch(new StartDiscoverBLEDevices()).subscribe();
      Diagnostic.registerBluetoothStateChangeHandler(() => {
        // Nothing to do
      });
    });
    this.alertService
      .show(
        {
          header: this.translateService.instant('BLUETOOTH.BLE_DISABLED.TITLE'),
          message: this.translateService.instant('BLUETOOTH.BLE_DISABLED.NOTICE'),
          animated: true,
          backdropDismiss: true,
          buttons: [
            {
              text: this.translateService.instant('GENERAL.GO_TO_SETTINGS'),
              handler: () => {
                if (Capacitor.getPlatform() == 'ios' || missingPermissions) {
                  Diagnostic.switchToSettings();
                } else {
                  Diagnostic.switchToBluetoothSettings();
                }
                return false;
              },
            },
          ],
        },
        false,
      )
      .then((alert) => {
        this.currentAlert?.dismiss();
        this.currentAlert = alert;
      });
    if (!this.listeningPlatformResume) {
      this.listeningPlatformResume = true;
      this.platform.resume.subscribe(() => {
        if (this.currentAlert) {
          this.currentAlert.dismiss();
          this.currentAlert = undefined;
          this.startDiscoverDevices();
        }
      });
    }
  }

  private scan(_scanDuration: number): Observable<unknown> {
    // FIXME : parameter "scanDuration" cannot be passed to new capacitor BLE API
    return new Observable((observer) => {
      BleClient.requestLEScan(
        {
          scanMode: ScanMode.SCAN_MODE_BALANCED,
        },
        (scanResult) => {
          const device = scanResult.device;

          const newDevice: RawBLEDevice = {
            id: device.deviceId,
            advertising: scanResult.rawAdvertisement ? scanResult.rawAdvertisement.buffer : new ArrayBuffer(0),
            name: device.name ? device.name : '',
            rssi: scanResult.rssi ? scanResult.rssi : 0,
          };
          observer.next(newDevice);
        },
      ).catch((e) => {
        observer.error(e);
      });
    });
  }
}
