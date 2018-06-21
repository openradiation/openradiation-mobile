import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { DevicesState } from '../../states/devices/devices.state';
import { Observable } from 'rxjs';
import { Device, DeviceStatus } from '../../states/devices/device';
import { ConnectDevice, DisconnectDevice, DiscoverDevices } from '../../states/devices/devices.action';

@Component({
  selector: 'devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss']
})
export class DevicesPage {
  @Select(DevicesState.deviceStatus) deviceStatus$: Observable<DeviceStatus[]>;
  @Select(DevicesState.knownDevices) knownDevices$: Observable<Device[]>;

  constructor(private store: Store) {}

  discoverDevices() {
    this.store.dispatch(new DiscoverDevices()).subscribe(data => console.log(data));
  }

  toggleDeviceStatus(deviceState: DeviceStatus) {
    if (deviceState.isConnected) {
      this.store.dispatch(new DisconnectDevice(deviceState.device));
    } else {
      this.store.dispatch(new ConnectDevice(deviceState.device));
    }
  }
}
