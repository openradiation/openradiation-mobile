import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { AbstractDevice } from '../../../states/devices/abstract-device';
import { DevicesState } from '../../../states/devices/devices.state';
import { StartMeasure, StartWatchPosition, StopWatchPosition } from '../../../states/measures/measures.action';
import { MeasuresState } from '../../../states/measures/measures.state';

@Component({
  selector: 'app-page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage extends AutoUnsubscribePage {
  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice | undefined>;
  @Select(MeasuresState.positionAccuracy)
  positionAccuracy$: Observable<number>;

  canStartMeasure: Observable<boolean>;

  url = '/tabs/(home:home)';

  constructor(
    protected router: Router,
    private store: Store,
    private actions$: Actions,
    private navController: NavController
  ) {
    super(router);

    this.canStartMeasure = this.connectedDevice$.pipe(map(connectedDevice => connectedDevice !== undefined));
  }

  pageEnter() {
    super.pageEnter();
    this.store.dispatch(new StartWatchPosition());
    this.subscriptions.push(
      this.actions$
        .pipe(ofActionSuccessful(StartMeasure))
        .subscribe(() => this.navController.navigateRoot(['measure', 'scan']))
    );
  }

  pageLeave() {
    super.pageLeave();
    this.store.dispatch(new StopWatchPosition());
  }

  goToDevices() {
    this.navController.navigateForward([
      'tabs',
      {
        outlets: {
          settings: 'devices',
          home: null
        }
      }
    ]);
  }

  startMeasure() {
    this.connectedDevice$.pipe(take(1)).subscribe(connectedDevice => {
      if (connectedDevice) {
        this.store.dispatch(new StartMeasure(connectedDevice));
      }
    });
  }
}
