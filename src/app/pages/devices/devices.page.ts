import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { DevicesState } from '../../states/device/devices.state';
import { Observable } from 'rxjs/internal/Observable';
import { Device } from '../../states/device/device';
import { AddDevice, ConnectDevice, DisconnectDevice } from '../../states/device/device.action';

@Component({
  selector: 'devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss']
})
export class DevicesPage {
  @Select(DevicesState.devices) devices$: Observable<Device[]>;

  constructor(private store: Store) {}

  addDevice() {
    this.store.dispatch(new AddDevice(new Device('', '', '', '', '')));
  }

  toggleDeviceConnection(device: Device) {
    if (device.connected) {
      this.store.dispatch(new DisconnectDevice(device));
    } else {
      this.store.dispatch(new ConnectDevice(device));
    }
  }
}
