import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofActionDispatched, ofActionSuccessful, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AutoUnsubscribePage } from '@app/components/auto-unsubscribe/auto-unsubscribe.page';
import { NavigationService } from '@app/services/navigation.service';
import { AbstractDevice } from '@app/states/devices/abstract-device';
import { Capacitor } from '@capacitor/core';

import {
  ConnectDevice,
  DeviceConnectionLost,
  DisconnectDevice,
  EditDeviceParams,
  StartDiscoverBLEDevices,
  StartDiscoverUSBDevices,
  StopDiscoverDevices,
  UpdateDeviceInfo
} from '@app/states/devices/devices.action';
import { DevicesState } from '@app/states/devices/devices.state';

@Component({
  selector: 'app-page-devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss']
})
export class DevicesPage extends AutoUnsubscribePage {
  availableDevices$: Observable<AbstractDevice[]> = inject(Store).select(DevicesState.availableDevices);
  availableDevices: AbstractDevice[] = [];
  knownDevices$: Observable<AbstractDevice[]> = inject(Store).select(DevicesState.knownDevices);
  knownDevices: AbstractDevice[] = [];
  isScanning$: Observable<boolean> = inject(Store).select(DevicesState.isScanning);
  connectedDevice$: Observable<AbstractDevice|undefined> = inject(Store).select(DevicesState.connectedDevice);

  connectingDevice: AbstractDevice | undefined;

  url = '/tabs/settings/devices';

  constructor(
    protected router: Router,
    private store: Store,
    private actions$: Actions,
    private navigationService: NavigationService
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
    if (Capacitor.getPlatform() == 'android') {
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
