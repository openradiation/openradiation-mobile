import { Injectable } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AlertController, Platform } from '@ionic/angular';
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
    private alertController: AlertController
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
            .isLocationAuthorized()
            .then(authorized => {
              if (!authorized) {
                return this.diagnostic.requestLocationAuthorization();
              } else {
                return true;
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
            .then(() => this.diagnostic.isGpsLocationEnabled())
            .then(enabled => {
              if (!enabled) {
                this.onGPSDisabled();
                throw 'disabled';
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
        header: 'Position - Permission refusée',
        message: `La position de l'appareil est nécessaire au bon fonctionnement de l'application. Merci d'accepter la permission.`,
        enableBackdropDismiss: false,
        buttons: [
          {
            text: 'Accéder aux paramètres',
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
        header: 'Position - GPS désactivé',
        message: `La position de l'appareil est nécessaire au bon fonctionnement de l'application. Merci d'activer le GPS.`,
        enableBackdropDismiss: false,
        buttons: [
          {
            text: 'Accéder aux paramètres',
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
