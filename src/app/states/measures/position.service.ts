import { Injectable } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionDispatched, ofActionSuccessful, Store } from '@ngxs/store';
import { defer, Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { take, takeUntil, tap } from 'rxjs/operators';
import { PositionChanged, StartWatchPosition, StopWatchPosition } from './measures.action';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private currentAlert?: any;

  constructor(
    private geolocation: Geolocation,
    private diagnostic: Diagnostic,
    private actions$: Actions,
    private platform: Platform,
    private store: Store,
    private alertController: AlertController,
    private translateService: TranslateService
  ) {
    this.actions$.pipe(ofActionDispatched(StartWatchPosition)).subscribe(() => {
      if (this.currentAlert) {
        this.currentAlert.dismiss();
        this.currentAlert = undefined;
      }
    });
  }

  startWatchPosition(): Observable<any> {
    return defer(() => {
      if (this.platform.is('cordova')) {
        return fromPromise(
          this.diagnostic
            .getLocationAuthorizationStatus()
            .then(status => {
              switch (status) {
                case this.diagnostic.permissionStatus.NOT_REQUESTED:
                  return this.diagnostic.requestLocationAuthorization();
                case this.diagnostic.permissionStatus.DENIED:
                  return this.platform.is('ios')
                    ? this.diagnostic.permissionStatus.DENIED_ALWAYS
                    : this.diagnostic.requestLocationAuthorization();
                default:
                  return status;
              }
            })
            .then(status => {
              switch (status) {
                case this.diagnostic.permissionStatus.DENIED:
                  this.store.dispatch(new StartWatchPosition());
                  throw status;
                case this.diagnostic.permissionStatus.DENIED_ALWAYS:
                  this.onGPSDeniedAlways();
                  throw status;
              }
            })
            .then(
              () =>
                this.platform.is('android')
                  ? this.diagnostic.isGpsLocationEnabled()
                  : this.diagnostic.isLocationEnabled()
            )
            .then(enabled => {
              if (!enabled) {
                this.onGPSDisabled();
                throw new Error('disabled');
              }
            })
        );
      } else {
        return of(null);
      }
    }).pipe(tap(() => this.watchPosition()));
  }

  private watchPosition() {
    this.geolocation
      .watchPosition({ enableHighAccuracy: true })
      .pipe(takeUntil(this.actions$.pipe(ofActionSuccessful(StopWatchPosition))))
      .subscribe(position => this.store.dispatch(new PositionChanged(position)));
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
              this.platform.resume.pipe(take(1)).subscribe(() => this.store.dispatch(new StartWatchPosition()));
              if (this.platform.is('ios')) {
                this.diagnostic.switchToSettings();
              } else {
                this.diagnostic.switchToLocationSettings();
              }
            }
          }
        ]
      })
      .then(alert => {
        this.currentAlert = alert;
        alert.present();
      });
  }

  private onGPSDisabled() {
    this.diagnostic.registerLocationStateChangeHandler(() => {
      this.store.dispatch(new StartWatchPosition()).subscribe();
      this.diagnostic.registerLocationStateChangeHandler(() => {});
    });
    this.alertController
      .create({
        header: this.translateService.instant('POSITION.GPS_DISABLED.TITLE'),
        message: this.translateService.instant('POSITION.GPS_DISABLED.NOTICE'),
        backdropDismiss: false,
        buttons: [
          {
            text: this.translateService.instant('GENERAL.GO_TO_SETTINGS'),
            handler: () => {
              if (this.platform.is('ios')) {
                this.diagnostic.switchToSettings();
              } else {
                this.diagnostic.switchToLocationSettings();
              }
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
