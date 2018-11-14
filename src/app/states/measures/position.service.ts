import { Injectable } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, Store } from '@ngxs/store';
import { BackgroundGeolocationPlugin, Location } from 'cordova-plugin-mauron85-background-geolocation';
import { Observable, Observer, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { concatMap, take, tap } from 'rxjs/operators';
import { PositionChanged } from './measures.action';

declare const BackgroundGeolocation: BackgroundGeolocationPlugin;

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private currentAlert?: any;
  isAcquiringPosition = false;
  startWatchOnHold = false;
  locationAuthorized = false;

  constructor(
    private diagnostic: Diagnostic,
    private actions$: Actions,
    private platform: Platform,
    private store: Store,
    private alertController: AlertController,
    private translateService: TranslateService,
    public loadingController: LoadingController
  ) {}

  init() {
    BackgroundGeolocation.configure({}, () => {
      this.watchPosition();
      this.requestAuthorization();
    });
  }

  getCurrentPosition(): Observable<Location | undefined> {
    this.isAcquiringPosition = true;
    return fromPromise(
      this.loadingController
        .create({
          message: this.translateService.instant('POSITION.ACQUISITION'),
          cssClass: 'custom-loading-indicator'
        })
        .then(loadingIndicator => loadingIndicator.present())
    ).pipe(
      concatMap(
        () => <Observable<Location | undefined>>Observable.create((observer: Observer<Location | undefined>) =>
            BackgroundGeolocation.getCurrentLocation(
              location => {
                observer.next(location);
                observer.complete();
              },
              () => {
                observer.next(undefined);
              },
              {
                timeout: 5000,
                maximumAge: 10000,
                enableHighAccuracy: true
              }
            )
          )
      ),
      tap(() => {
        this.loadingController.dismiss();
        this.isAcquiringPosition = false;
      })
    );
  }

  startWatchPosition(): Observable<Location | undefined> {
    if (this.locationAuthorized) {
      this.startWatchOnHold = false;
      BackgroundGeolocation.start();
    } else {
      this.startWatchOnHold = true;
    }
    return of(undefined);
  }

  stopWatchPosition(): Observable<any> {
    this.startWatchOnHold = false;
    BackgroundGeolocation.stop();
    return of(null);
  }

  private watchPosition() {
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
            this.locationAuthorized = true;
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
      if (!enabled) {
        this.onGPSDisabled();
      } else if (this.startWatchOnHold) {
        this.startWatchPosition();
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
