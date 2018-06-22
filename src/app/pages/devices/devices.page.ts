import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { DevicesState } from '../../states/devices/devices.state';
import { Observable } from 'rxjs';
import { Device, DeviceStatus } from '../../states/devices/device';
import {
  ConnectDevice,
  DisconnectDevice,
  StartDiscoverDevices,
  StopDiscoverDevices
} from '../../states/devices/devices.action';
import { catchError } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss']
})
export class DevicesPage {
  @Select(DevicesState.deviceStatus) deviceStatus$: Observable<DeviceStatus[]>;
  @Select(DevicesState.knownDevices) knownDevices$: Observable<Device[]>;
  @Select(DevicesState.isScanning) isScanning$: Observable<boolean>;

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

  toggleDeviceStatus(deviceState: DeviceStatus) {
    if (deviceState.isConnected) {
      this.store.dispatch(new DisconnectDevice(deviceState.device));
    } else {
      this.store.dispatch(new ConnectDevice(deviceState.device));
    }
  }

  deviceStatusTrackBy(index: number, deviceStatus: DeviceStatus): string | number {
    return deviceStatus.device.sensorUUID;
  }
}
