import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AutoUnsubscribePage } from '../../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { NavigationService } from '../../../../services/navigation.service';
import { AbstractDevice } from '../../../../states/devices/abstract-device';
import {
  ConnectDevice,
  DeviceConnectionLost,
  DisconnectDevice,
  EditDeviceParams,
  StartDiscoverBLEDevices,
  StartDiscoverUSBDevices,
  StopDiscoverDevices,
  UpdateDeviceInfo
} from '../../../../states/devices/devices.action';
import { DevicesState } from '../../../../states/devices/devices.state';

@Component({
  selector: 'app-page-devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss']
})
export class DevicesPage extends AutoUnsubscribePage {
  @Select(DevicesState.availableDevices)
  availableDevices$: Observable<AbstractDevice[]>;
  availableDevices: AbstractDevice[] = [];
  @Select(DevicesState.knownDevices)
  knownDevices$: Observable<AbstractDevice[]>;
  knownDevices: AbstractDevice[] = [];
  @Select(DevicesState.isScanning)
  isScanning$: Observable<boolean>;
  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice>;

  connectingDevice: AbstractDevice | undefined;

  url = '/tabs/settings/devices';

  constructor(
    protected router: Router,
    private store: Store,
    private actions$: Actions,
    private navigationService: NavigationService,
    private platform: Platform
  ) {
    super(router);
  }

  pageEnter() {
    super.pageEnter();
    this.subscriptions.push(
      this.actions$
        .pipe(ofActionDispatched(ConnectDevice))
        .subscribe(({ device }: ConnectDevice) => (this.connectingDevice = device)),
      this.actions$
        .pipe(ofActionSuccessful(ConnectDevice, DeviceConnectionLost))
        .subscribe(() => (this.connectingDevice = undefined)),
      this.availableDevices$.subscribe(availableDevices => (this.availableDevices = availableDevices)),
      this.knownDevices$.subscribe(knownDevices => (this.knownDevices = knownDevices))
    );
    this.store.dispatch(new StartDiscoverBLEDevices()).subscribe();
    if (this.platform.is('android')) {
      this.store.dispatch(new StartDiscoverUSBDevices()).subscribe();
    }
  }

  pageLeave() {
    super.pageLeave();
    this.store.dispatch(new StopDiscoverDevices()).subscribe();
  }

  connectDevice(device: AbstractDevice) {
    this.store.dispatch(new ConnectDevice(device)).subscribe(() => this.store.dispatch(new UpdateDeviceInfo(device)));
  }

  disconnectDevice() {
    this.store.dispatch(new DisconnectDevice()).subscribe();
  }

  editDeviceParams(event: Event, device: AbstractDevice) {
    event.stopPropagation();
    this.store
      .dispatch(new EditDeviceParams(device))
      .subscribe(() => this.navigationService.navigateForward(['tabs', 'settings', 'device-param']));
  }

  goBack() {
    this.navigationService.goBack();
  }
}
