import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '@app/components/auto-unsubscribe/auto-unsubscribe.page';
import { AlertService } from '@app/services/alert.service';
import { NavigationService } from '@app/services/navigation.service';
import { AbstractDevice } from '@app/states/devices/abstract-device';
import { DevicesState } from '@app/states/devices/devices.state';
import { StartMeasure } from '@app/states/measures/measures.action';
import { MeasuresState } from '@app/states/measures/measures.state';
import { Location } from '@capacitor-community/background-geolocation';
import { PositionService } from '@app/states/measures/position.service';
import {
  ConnectDevice,
  DeactivateDisconnectedMeasureMode,
  DisconnectedMeasureSynchronizationSuccess,
  UpdateDeviceInfo,
} from '@app/states/devices/devices.action';
import { DevicesService } from '@app/states/devices/devices.service';

@Component({
  selector: 'app-page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage extends AutoUnsubscribePage {
  connectedDevice$: Observable<AbstractDevice | undefined> = inject(Store).select(DevicesState.connectedDevice);
  deviceInDisconnectedMeasureMode$: Observable<AbstractDevice | undefined> = inject(Store).select(
    DevicesState.deviceInDisconnectedMeasureMode,
  );
  positionAccuracy$: Observable<number> = inject(Store).select(MeasuresState.positionAccuracy);
  planeMode$: Observable<boolean> = inject(Store).select(MeasuresState.planeMode);
  currentPosition$: Observable<Location | undefined> = inject(Store).select(MeasuresState.currentPosition);

  canStartMeasure: Observable<boolean>;
  synchronizingDisconnectedMeasure: boolean;
  url = '/tabs/home';

  constructor(
    protected router: Router,
    private store: Store,
    private actions$: Actions,
    private alertService: AlertService,
    private translateService: TranslateService,
    private navigationService: NavigationService,
    private positionService: PositionService,
    private devicesService: DevicesService,
  ) {
    super(router);
    this.canStartMeasure = this.connectedDevice$.pipe(map((connectedDevice) => connectedDevice !== undefined));
  }

  pageEnter() {
    super.pageEnter();
    this.planeMode$.pipe(take(1)).subscribe((planeMode) => {
      if (planeMode === false) {
        this.subscriptions.push(
          this.currentPosition$.subscribe((position) => {
            if (position?.altitude && position.altitude > 6000) {
              this.showElevatedAltitudeMessage();
            }
          }),
        );
      }
    });
    this.subscriptions.push(
      this.actions$
        .pipe(ofActionSuccessful(StartMeasure))
        .subscribe(() => this.navigationService.navigateRoot(['measure', 'scan'])),
    );
    this.subscriptions.push(
      this.actions$.pipe(ofActionSuccessful(DisconnectedMeasureSynchronizationSuccess)).subscribe(() => {
        this.synchronizingDisconnectedMeasure = false;
        this.store.dispatch(new DeactivateDisconnectedMeasureMode());
      }),
    );
  }

  goToDevices() {
    this.navigationService.navigateForward(['tabs', 'settings', 'devices']);
  }

  showElevatedAltitudeMessage() {
    this.alertService.show({
      header: this.translateService.instant('HOME.ELEVATED_ALTITUDE'),
      message: this.translateService.instant('HOME.ELEVATED_ALTITUDE_MESSAGE'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translateService.instant('GENERAL.CANCEL'),
        },
        {
          text: this.translateService.instant('HOME.SWITCH_PLANE_MODE'),
          handler: () => this.goToPlaneMode(),
        },
      ],
    });
  }

  goToPlaneMode() {
    this.navigationService.navigateForward(['tabs', 'settings', 'plane-mode'], { animated: true });
  }

  async startMeasure() {
    const hasLocationEnabled = await this.positionService.requestAuthorization();
    if (hasLocationEnabled) {
      this.connectedDevice$.pipe(take(1)).subscribe((connectedDevice) => {
        if (connectedDevice) {
          this.store.dispatch(new StartMeasure(connectedDevice));
        }
      });
    }
  }

  forgetSensor() {
    this.store.dispatch(new DeactivateDisconnectedMeasureMode());
  }

  async reconnectSensor() {
    const hasLocationEnabled = await this.positionService.requestAuthorization();
    if (hasLocationEnabled) {
      this.deviceInDisconnectedMeasureMode$.pipe(take(1)).subscribe((device) => {
        if (device) {
          this.store.dispatch(new ConnectDevice(device)).subscribe(() => {
            this.store.dispatch(new UpdateDeviceInfo(device));
            this.synchronizingDisconnectedMeasure = true;
            this.devicesService.service(device).synchronizeDisconnectedMeasure(device);
          });
        }
      });
    }
  }
}
