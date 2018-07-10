import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { PositionChanged, StopWatchPosition } from './measures.action';
import { Platform } from '@ionic/angular';
import { defer, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MeasuresService {
  constructor(
    private geolocation: Geolocation,
    private diagnostic: Diagnostic,
    private actions$: Actions,
    private platform: Platform,
    private store: Store
  ) {}

  startWatchPosition(): Observable<any> {
    return defer(() => {
      if (this.platform.is('cordova')) {
        return fromPromise(
          this.diagnostic.isLocationAvailable().catch(() => this.diagnostic.requestLocationAuthorization())
        );
      } else {
        return of(null);
      }
    }).pipe(
      switchMap(() => this.geolocation.getCurrentPosition({ enableHighAccuracy: true })),
      tap(() => this.watchPosition())
    );
  }

  private watchPosition() {
    this.geolocation
      .watchPosition({ enableHighAccuracy: true })
      .pipe(takeUntil(this.actions$.pipe(ofActionSuccessful(StopWatchPosition))))
      .subscribe(position => this.store.dispatch(new PositionChanged(position)));
  }
}
