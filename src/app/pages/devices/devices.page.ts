import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { DevicesState } from '../../states/device/devices.state';
import { Observable } from 'rxjs';
import { Device, DeviceStatus } from '../../states/device/device';
import { AddDevice, ConnectDevice, DisconnectDevice } from '../../states/device/device.action';

@Component({
  selector: 'devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss']
})
export class DevicesPage {
  @Select(DevicesState.deviceStatus) deviceStatus$: Observable<DeviceStatus[]>;

  constructor(private store: Store) {}

  addDevice() {
    this.store.dispatch(new AddDevice(new Device('', '', '', '', '')));
  }

  toggleDeviceStatus(deviceState: DeviceStatus) {
    if (deviceState.isConnected) {
      this.store.dispatch(new DisconnectDevice(deviceState.device));
    } else {
      this.store.dispatch(new ConnectDevice(deviceState.device));
    }
  }
}
