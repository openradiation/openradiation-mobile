import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AutoUnsubscribePage } from '../../../../components/page/auto-unsubscribe.page';
import { AbstractDevice } from '../../../../states/devices/abstract-device';
import {
  ConnectDevice,
  DisconnectDevice,
  EditDeviceParams,
  StartDiscoverDevices,
  StopDiscoverDevices,
  UpdateDeviceInfo
} from '../../../../states/devices/devices.action';
import { DevicesState } from '../../../../states/devices/devices.state';
import { TabsService } from '../../tabs.service';

@Component({
  selector: 'app-page-devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss']
})
export class DevicesPage extends AutoUnsubscribePage {
  @Select(DevicesState.availableDevices)
  availableDevices$: Observable<AbstractDevice[]>;
  @Select(DevicesState.knownDevices)
  knownDevices$: Observable<AbstractDevice[]>;
  @Select(DevicesState.isScanning)
  isScanning$: Observable<boolean>;
  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice>;

  connectingDevice: AbstractDevice | undefined;

  constructor(
    protected tabsService: TabsService,
    protected elementRef: ElementRef,
    private store: Store,
    private router: Router,
    private actions$: Actions
  ) {
    super(tabsService, elementRef);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.subscriptions.push(
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

  connectDevice(device: AbstractDevice) {
    this.store.dispatch(new ConnectDevice(device)).subscribe(() => this.store.dispatch(new UpdateDeviceInfo(device)));
  }

  disconnectDevice() {
    this.store.dispatch(new DisconnectDevice()).subscribe();
  }

  editDeviceParams(event: Event, device: AbstractDevice) {
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
