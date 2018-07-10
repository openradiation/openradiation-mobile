import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Actions, ofActionDispatched, ofActionErrored, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
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
import { AutoUnsubscribePage } from '../../auto-unsubscribe.page';

@Component({
  selector: 'app-page-devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss']
})
export class DevicesPage extends AutoUnsubscribePage {
  @Select(DevicesState.availableDevices) availableDevices$: Observable<Device[]>;
  @Select(DevicesState.knownDevices) knownDevices$: Observable<Device[]>;
  @Select(DevicesState.isScanning) isScanning$: Observable<boolean>;
  @Select(DevicesState.connectedDevice) connectedDevice$: Observable<Device>;

  connectingDevice: Device | undefined;

  constructor(
    private store: Store,
    private toastController: ToastController,
    private router: Router,
    private actions$: Actions
  ) {
    super();
  }

  ionViewDidEnter() {
    this.subscriptions.push(
      this.actions$
        .pipe(ofActionSuccessful(WaitForBLEConnection))
        .subscribe(() => this.store.dispatch(new StartDiscoverDevices()).subscribe()),
      this.actions$.pipe(ofActionErrored(StartDiscoverDevices)).subscribe(() => this.onBLEError()),
      this.actions$.pipe(ofActionSuccessful(BLEConnectionLost)).subscribe(() => this.onBLEError()),
      this.actions$
        .pipe(ofActionDispatched(ConnectDevice))
        .subscribe((action: ConnectDevice) => (this.connectingDevice = action.device)),
      this.actions$.pipe(ofActionSuccessful(ConnectDevice)).subscribe(() => (this.connectingDevice = undefined))
    );
    this.store.dispatch(new StartDiscoverDevices()).subscribe();
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.store.dispatch(new StopDiscoverDevices()).subscribe();
  }

  private onBLEError() {
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
