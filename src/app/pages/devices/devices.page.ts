import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Device } from '../../states/devices/device';
import {
  ConnectDevice,
  DisconnectDevice,
  StartDiscoverDevices,
  StopDiscoverDevices
} from '../../states/devices/devices.action';
import { DevicesState } from '../../states/devices/devices.state';

@Component({
  selector: 'devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss']
})
export class DevicesPage {
  @Select(DevicesState.availableDevices) availableDevices$: Observable<Device[]>;
  @Select(DevicesState.knownDevices) knownDevices$: Observable<Device[]>;
  @Select(DevicesState.isScanning) isScanning$: Observable<boolean>;
  @Select(DevicesState.connectedDevice) connectedDevice$: Observable<Device>;

  constructor(private store: Store, private toastController: ToastController) {}

  startDiscoverDevices() {
    this.store
      .dispatch(new StartDiscoverDevices())
      .pipe(
        catchError(err => {
          this.toastController
            .create({
              message: 'Bluetooth not available, please active it',
              closeButtonText: 'Ok',
              duration: 3000,
              showCloseButton: true
            })
            .then(toast => toast.present());
          return err;
        })
      )
      .subscribe();
  }

  stopDiscoverDevices() {
    this.store.dispatch(new StopDiscoverDevices()).subscribe();
  }

  connectDevice(device: Device) {
    this.store.dispatch(new ConnectDevice(device)).subscribe();
  }

  disconnectDevice(device: Device) {
    this.store.dispatch(new DisconnectDevice(device));
  }
}
