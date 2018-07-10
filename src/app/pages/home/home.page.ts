import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Actions, ofActionErrored, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Device } from '../../states/devices/device';
import { DevicesState } from '../../states/devices/devices.state';
import { StartWatchPosition, StopWatchPosition } from '../../states/measures/measures.action';
import { MeasuresState } from '../../states/measures/measures.state';
import { AutoUnsubscribePage } from '../auto-unsubscribe.page';
import { ToastController } from '@ionic/angular';
import { PositionAccuracy } from '../../states/measures/measure';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage extends AutoUnsubscribePage {
  @Select(DevicesState.connectedDevice) connectedDevice$: Observable<Device>;
  @Select(MeasuresState.positionAccuracy) positionAccuracy$: Observable<PositionAccuracy>;

  positionAccuracy = PositionAccuracy;

  constructor(
    private router: Router,
    private store: Store,
    private toastController: ToastController,
    private actions$: Actions
  ) {
    super();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd && event.url !== '/#'))
      .subscribe(event => {
        if (event.url === '/tabs/(home:home)') {
          this.store.dispatch(new StartWatchPosition()).subscribe();
          this.subscriptions.push(
            this.actions$.pipe(ofActionErrored(StartWatchPosition)).subscribe(() => this.onGPSError())
          );
        } else {
          this.store.dispatch(new StopWatchPosition());
          this.ionViewWillLeave();
        }
      });
  }

  goToDevices() {
    this.router.navigate([
      'tabs',
      {
        outlets: {
          settings: 'devices',
          home: null
        }
      }
    ]);
  }

  startMeasure() {}

  onGPSError() {
    this.toastController
      .create({
        message: 'GPS not available, please active it',
        closeButtonText: 'Ok',
        duration: 3000,
        showCloseButton: true
      })
      .then(toast => toast.present());
  }
}
