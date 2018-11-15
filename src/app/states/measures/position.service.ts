import { Injectable } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { BackgroundGeolocationPlugin } from 'cordova-plugin-mauron85-background-geolocation';
import { take } from 'rxjs/operators';
import { PositionChanged } from './measures.action';

/**
 * Constants from cordova-plugin-mauron85-background-geolocation
 */
declare const BackgroundGeolocation: BackgroundGeolocationPlugin;

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private currentAlert?: any;
  isAcquiringPosition = false;

  constructor(
    private diagnostic: Diagnostic,
    private platform: Platform,
    private store: Store,
    private alertController: AlertController,
    private translateService: TranslateService
  ) {}

  init() {
    BackgroundGeolocation.configure(
      {
        locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
        desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
        stationaryRadius: 50,
        distanceFilter: 50,
        notificationTitle: this.translateService.instant('POSITION.BACKGROUND.TITLE'),
        notificationText: this.translateService.instant('POSITION.BACKGROUND.TEXT'),
        notificationIconColor: '#045cb8',
        interval: 10000,
        fastestInterval: 5000,
        activitiesInterval: 10000,
        maxLocations: 1
      },
      () => {
        this.watchPosition();
        this.requestAuthorization();
      }
    );
  }

  private watchPosition() {
    BackgroundGeolocation.getLocations(positions => {
      this.store.dispatch(new PositionChanged(positions[0]));
    });
    BackgroundGeolocation.on('location', position =>
      BackgroundGeolocation.startTask(taskKey => {
        this.store.dispatch(new PositionChanged(position));
        BackgroundGeolocation.endTask(taskKey);
      })
    );
  }

  private requestAuthorization() {
    if (this.currentAlert) {
      this.currentAlert.dismiss();
      this.currentAlert = undefined;
    }
    this.diagnostic
      .getLocationAuthorizationStatus()
      .then(
        status =>
          this.platform.is('ios') && status === this.diagnostic.permissionStatus.DENIED
            ? this.diagnostic.permissionStatus.DENIED_ALWAYS
            : status
      )
      .then(status => {
        switch (status) {
          case this.diagnostic.permissionStatus.NOT_REQUESTED:
          case this.diagnostic.permissionStatus.DENIED:
            return this.diagnostic.requestLocationAuthorization();
          default:
            return status;
        }
      })
      .then(status => {
        switch (status) {
          case this.diagnostic.permissionStatus.DENIED_ALWAYS:
            this.onGPSDeniedAlways();
            break;
          case this.diagnostic.permissionStatus.GRANTED:
            this.watchGPSActivation();
            break;
          default:
            this.requestAuthorization();
        }
      });
  }

  private onGPSDeniedAlways() {
    this.alertController
      .create({
        header: this.translateService.instant('POSITION.DENIED_ALWAYS.TITLE'),
        message: this.translateService.instant('POSITION.DENIED_ALWAYS.NOTICE'),
        backdropDismiss: false,
        buttons: [
          {
            text: this.translateService.instant('GENERAL.GO_TO_SETTINGS'),
            handler: () => {
              this.platform.resume.pipe(take(1)).subscribe(() => this.requestAuthorization());
              BackgroundGeolocation.showAppSettings();
            }
          }
        ]
      })
      .then(alert => {
        this.currentAlert = alert;
        alert.present();
      });
  }

  private watchGPSActivation() {
    if (this.currentAlert) {
      this.currentAlert.dismiss();
      this.currentAlert = undefined;
    }
    this.diagnostic.registerLocationStateChangeHandler(() => {
      this.watchGPSActivation();
    });

    const isLocationEnabled = this.platform.is('android')
      ? this.diagnostic.isGpsLocationEnabled()
      : this.diagnostic.isLocationEnabled();
    isLocationEnabled.then(enabled => {
      if (enabled) {
        BackgroundGeolocation.start();
      } else {
        this.onGPSDisabled();
      }
    });
  }

  private onGPSDisabled() {
    this.alertController
      .create({
        header: this.translateService.instant('POSITION.GPS_DISABLED.TITLE'),
        message: this.platform.is('ios')
          ? this.translateService.instant('POSITION.GPS_DISABLED.NOTICE_IOS')
          : this.translateService.instant('POSITION.GPS_DISABLED.NOTICE_ANDROID'),
        backdropDismiss: false,
        buttons: [
          {
            text: this.translateService.instant('GENERAL.GO_TO_SETTINGS'),
            handler: () => {
              BackgroundGeolocation.showLocationSettings();
              return false;
            }
          }
        ]
      })
      .then(alert => {
        this.currentAlert = alert;
        alert.present();
      });
  }
}
