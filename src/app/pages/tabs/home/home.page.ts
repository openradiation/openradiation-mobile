import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AbstractDevice } from '../../../states/devices/abstract-device';
import { DevicesState } from '../../../states/devices/devices.state';
import { PositionAccuracy } from '../../../states/measures/measure';
import { StartMeasure, StartWatchPosition, StopWatchPosition } from '../../../states/measures/measures.action';
import { MeasuresState } from '../../../states/measures/measures.state';
import { AutoUnsubscribePage } from '../../../components/page/auto-unsubscribe.page';
import { TabsService } from '../tabs.service';

@Component({
  selector: 'app-page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage extends AutoUnsubscribePage {
  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice>;
  @Select(MeasuresState.positionAccuracy)
  positionAccuracy$: Observable<PositionAccuracy>;

  positionAccuracyEnum = PositionAccuracy;

  constructor(
    protected tabsService: TabsService,
    protected elementRef: ElementRef,
    private router: Router,
    private store: Store,
    private actions$: Actions
  ) {
    super(tabsService, elementRef);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.store.dispatch(new StartWatchPosition());
    this.subscriptions.push(
      this.actions$.pipe(ofActionSuccessful(StartMeasure)).subscribe(() => this.router.navigate(['measure', 'scan']))
    );
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.store.dispatch(new StopWatchPosition());
  }

  goToDevices() {
    this.router
      .navigate([
        'tabs',
        {
          outlets: {
            settings: 'settings',
            home: null
          }
        }
      ])
      .then(() =>
        this.router.navigate([
          'tabs',
          {
            outlets: {
              settings: 'devices'
            }
          }
        ])
      );
  }

  startMeasure() {
    this.connectedDevice$
      .pipe(take(1))
      .subscribe(connectedDevice => this.store.dispatch(new StartMeasure(connectedDevice)));
  }
}
