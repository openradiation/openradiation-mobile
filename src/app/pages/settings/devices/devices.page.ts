import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Actions, ofActionErrored, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { Device } from '../../../states/devices/device';
import {
  BLEConnectionLost,
  ConnectDevice,
  DisconnectDevice,
  EditDeviceParams,
  StartDiscoverDevices,
  StopDiscoverDevices,
  UpdateDeviceInfo,
  WaitForBLEConnection
} from '../../../states/devices/devices.action';
import { DevicesState } from '../../../states/devices/devices.state';

@Component({
  selector: 'app-page-devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss']
})
export class DevicesPage {
  @Select(DevicesState.availableDevices) availableDevices$: Observable<Device[]>;
  @Select(DevicesState.knownDevices) knownDevices$: Observable<Device[]>;
  @Select(DevicesState.isScanning) isScanning$: Observable<boolean>;
  @Select(DevicesState.connectedDevice) connectedDevice$: Observable<Device>;

  private actionsSubscription: Subscription[] = [];

  constructor(
    private store: Store,
    private toastController: ToastController,
    private router: Router,
    private actions$: Actions
  ) {}

  ionViewDidEnter() {
    this.actionsSubscription.push(
      this.actions$
        .pipe(ofActionSuccessful(WaitForBLEConnection))
        .subscribe(() => this.store.dispatch(new StartDiscoverDevices()).subscribe()),
      this.actions$.pipe(ofActionErrored(StartDiscoverDevices)).subscribe(() => this.onBLEError()),
      this.actions$.pipe(ofActionSuccessful(BLEConnectionLost)).subscribe(() => this.onBLEError())
    );
    this.startDiscoverDevices();
  }

  ionViewWillLeave() {
    this.actionsSubscription.forEach(subscription => subscription.unsubscribe());
    this.actionsSubscription = [];
    this.stopDiscoverDevices();
  }

  onBLEError() {
    this.store.dispatch(new WaitForBLEConnection()).subscribe();
    this.toastController
      .create({
        message: 'Bluetooth not available, please active it',
        closeButtonText: 'Ok',
        duration: 3000,
        showCloseButton: true
      })
      .then(toast => toast.present());
  }

  startDiscoverDevices() {
    this.store.dispatch(new StartDiscoverDevices()).subscribe();
  }

  stopDiscoverDevices() {
    this.store.dispatch(new StopDiscoverDevices()).subscribe();
  }

  connectDevice(device: Device) {
    this.store.dispatch(new ConnectDevice(device)).subscribe(() => this.store.dispatch(new UpdateDeviceInfo(device)));
  }

  disconnectDevice() {
    this.store.dispatch(new DisconnectDevice()).subscribe();
  }

  editDeviceParams(event: Event, device: Device) {
    event.stopPropagation();
    this.store.dispatch(new EditDeviceParams(device)).subscribe(() =>
      this.router.navigate([
        'tabs',
        {
          outlets: {
            settings: 'device-param'
          }
        }
      ])
    );
  }

  goToSettings() {
    this.router.navigate([
      'tabs',
      {
        outlets: {
          settings: 'settings'
        }
      }
    ]);
  }
}
