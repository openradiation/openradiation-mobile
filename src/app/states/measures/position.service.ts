import { Injectable } from '@angular/core';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { AlertService } from '@app/services/alert.service';
import { PositionChanged } from './measures.action';
import { MeasuresStateModel } from './measures.state';
import { registerPlugin } from "@capacitor/core";
import { BackgroundGeolocationPlugin, Location } from "@capacitor-community/background-geolocation";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';


/**
 * Constant from @mauron85/cordova-plugin-background-geolocation
 */
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private currentAlert?: HTMLIonAlertElement;
  private currentWatcherId = "";

  constructor(
    private platform: Platform,
    private store: Store,
    private alertService: AlertService,
    private translateService: TranslateService
  ) { }

  private async watchPosition() {
    this.startWatchPosition();

    // When pausing app, also stop listening GPS position unless there is an ongoin scan
    this.platform.pause.subscribe(async () => {
      const onGoingMeasuresScan = this.store.selectSnapshot(
        ({ measures }: { measures: MeasuresStateModel }) => measures.currentMeasure || measures.currentSeries
      );
      if (!onGoingMeasuresScan && this.currentWatcherId) {
        await BackgroundGeolocation.removeWatcher({ id: this.currentWatcherId });
        this.currentWatcherId = "";
      }
    });
  }

  private async startWatchPosition() {
    // If not already watching position
    if (!this.currentWatcherId) {
      this.store.dispatch(new PositionChanged(undefined));

      // Step 1: get quickly last known position (allow stale, no need for permissions)
      const tempPositionWatcherId = await BackgroundGeolocation.addWatcher({ requestPermissions: false, stale: true },
        (position) => { this.positionReceived(position) }
      );
      BackgroundGeolocation.removeWatcher({ id: tempPositionWatcherId });

      // Step 2: register for location updates
      this.currentWatcherId = await BackgroundGeolocation.addWatcher({
        backgroundMessage: this.translateService.instant('POSITION.BACKGROUND.TEXT'),
        backgroundTitle: this.translateService.instant('POSITION.BACKGROUND.TITLE'),
        requestPermissions: true,
        stale: false,
        distanceFilter: 20
      },
        (position, error) => {
          if (position && !error) {
            this.positionReceived(position)
          } else if (error && error.code === "NOT_AUTHORIZED") {
            this.onGPSDeniedAlways();
          }
        }
      );
    }
  }

  positionReceived(position?: Location) {
    this.store.dispatch(new PositionChanged(position));
  }

  public async requestAuthorization() {
    if (this.currentAlert) {
      this.currentAlert.dismiss();
      this.currentAlert = undefined;
    }
    let locationAuthorizedStatus = await Diagnostic.getLocationAuthorizationStatus();
    locationAuthorizedStatus = (Capacitor.getPlatform() == 'ios'
      && locationAuthorizedStatus === Diagnostic.permissionStatus.DENIED)
      ? Diagnostic.permissionStatus.DENIED_ALWAYS
      : locationAuthorizedStatus
    switch (locationAuthorizedStatus) {
      case Diagnostic.permissionStatus.NOT_REQUESTED:
      case Diagnostic.permissionStatus.DENIED:
        locationAuthorizedStatus = await Diagnostic.requestLocationAuthorization(Diagnostic.locationAuthorizationMode.ALWAYS);
        this.platform.resume.subscribe(() => this.requestAuthorization());
    }
    switch (locationAuthorizedStatus) {
      case Diagnostic.permissionStatus.DENIED_ALWAYS:
        this.onGPSDeniedAlways();
        this.platform.resume.subscribe(() => this.requestAuthorization());
        break;
      case Diagnostic.permissionStatus.GRANTED:
      case Diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
        // On Android, also need to check for local notifications permissions
        if (Capacitor.getPlatform() == 'android') {
          let localNotificationStatus = await LocalNotifications.checkPermissions();
          if (localNotificationStatus.display != 'granted') {
            localNotificationStatus = await LocalNotifications.requestPermissions();
          }
          if (localNotificationStatus.display == 'granted') {
            this.watchGPSActivation();
          }
        } else {
          this.watchGPSActivation();
        }
        break;
      default:
        this.requestAuthorization();
    }
  }

  private onGPSDeniedAlways() {
    this.alertService
      .show(
        {
          header: this.translateService.instant('POSITION.DENIED_ALWAYS.TITLE'),
          message: Capacitor.getPlatform() == 'ios'
            ? this.translateService.instant('POSITION.DENIED_ALWAYS.NOTICE.IOS')
            : this.translateService.instant('POSITION.DENIED_ALWAYS.NOTICE.ANDROID'),
          animated: true,
          backdropDismiss: true,
          buttons: [
            {
              text: this.translateService.instant('GENERAL.GO_TO_SETTINGS'),
              handler: () => {
                this.platform.resume.pipe(take(1)).subscribe(() => this.requestAuthorization());
                BackgroundGeolocation.openSettings();
              }
            }
          ]
        },
        false
      )
      .then(alert => (this.currentAlert = alert));
  }

  private watchGPSActivation() {
    if (this.currentAlert) {
      this.currentAlert.dismiss();
      this.currentAlert = undefined;
    }
    Diagnostic.registerLocationStateChangeHandler(() => {
      this.watchGPSActivation();
    });

    const isLocationEnabled = Capacitor.getPlatform() == 'android'
      ? Diagnostic.isGpsLocationEnabled()
      : Diagnostic.isLocationEnabled();
    isLocationEnabled.then(enabled => {
      if (enabled) {
        this.watchPosition();
      } else {
        this.onGPSDisabled();
      }
    });
  }

  private onGPSDisabled() {
    this.alertService
      .show(
        {
          header: this.translateService.instant('POSITION.GPS_DISABLED.TITLE'),
          message: Capacitor.getPlatform() == 'ios'
            ? this.translateService.instant('POSITION.GPS_DISABLED.NOTICE.IOS')
            : this.translateService.instant('POSITION.GPS_DISABLED.NOTICE.ANDROID'),
          animated: true,
          backdropDismiss: true,
          buttons: [

          ]
        },
        false
      )
      .then(alert => (this.currentAlert = alert));
  }
}
