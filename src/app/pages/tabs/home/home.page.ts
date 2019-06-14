import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { NavigationService } from '../../../services/navigation.service';
import { AbstractDevice } from '../../../states/devices/abstract-device';
import { DevicesState } from '../../../states/devices/devices.state';
import { StartMeasure } from '../../../states/measures/measures.action';
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

  url = '/tabs/home';

  constructor(
    protected router: Router,
    private store: Store,
    private actions$: Actions,
    private navigationService: NavigationService
  ) {
    super(router);

    this.canStartMeasure = this.connectedDevice$.pipe(map(connectedDevice => connectedDevice !== undefined));
  }

  pageEnter() {
    super.pageEnter();
    this.subscriptions.push(
      this.actions$
        .pipe(ofActionSuccessful(StartMeasure))
        .subscribe(() => this.navigationService.navigateRoot(['measure', 'scan']))
    );
  }

  goToDevices() {
    this.navigationService.navigateForward(['tabs', 'settings', 'devices']);
  }

  startMeasure() {
    this.connectedDevice$.pipe(take(1)).subscribe(connectedDevice => {
      if (connectedDevice) {
        this.store.dispatch(new StartMeasure(connectedDevice));
      }
    });
  }
}
