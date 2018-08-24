import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AbstractDevice } from '../../../states/devices/abstract-device';
import { DevicesState } from '../../../states/devices/devices.state';
import { HitsAccuracy, HitsAccuracyThreshold, Measure } from '../../../states/measures/measure';
import {
  PositionChanged,
  StartMeasureScan,
  StartWatchPosition,
  StopMeasureScan,
  StopWatchPosition
} from '../../../states/measures/measures.action';
import { MeasuresState } from '../../../states/measures/measures.state';
import { AutoUnsubscribePage } from '../../../components/page/auto-unsubscribe.page';
import { TabsService } from '../../tabs/tabs.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-measure-scan',
  templateUrl: './measure-scan.page.html',
  styleUrls: ['./measure-scan.page.scss']
})
export class MeasureScanPage extends AutoUnsubscribePage {
  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure | undefined>;

  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice | undefined>;

  hitsAccuracy: HitsAccuracy = HitsAccuracy.start;
  hitsAccuracyThreshold = HitsAccuracyThreshold;
  hitsAccuracyWidth = 0;

  constructor(
    protected tabsService: TabsService,
    protected elementRef: ElementRef,
    private store: Store,
    private router: Router,
    private actions$: Actions
  ) {
    super(tabsService, elementRef);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.subscriptions.push(
      this.currentMeasure$.subscribe(measure => this.updateHitsAccuracy(measure)),
      this.actions$
        .pipe(ofActionSuccessful(StopMeasureScan))
        .subscribe(() => this.router.navigate(['measure', 'report']))
    );
    this.connectedDevice$.pipe(take(1)).subscribe(connectedDevice => {
      if (connectedDevice) {
        this.store.dispatch(new StartMeasureScan(connectedDevice)).subscribe();
      }
    });
  }

  updateHitsAccuracy(measure?: Measure) {
    if (measure) {
      if (measure.hitsNumber >= HitsAccuracyThreshold.accurate) {
        this.hitsAccuracy = HitsAccuracy.accurate;
      } else if (measure.hitsNumber >= HitsAccuracyThreshold.good) {
        this.hitsAccuracy = HitsAccuracy.good;
      } else if (measure.hitsNumber >= HitsAccuracyThreshold.medium) {
        this.hitsAccuracy = HitsAccuracy.medium;
      } else if (measure.hitsNumber >= HitsAccuracyThreshold.bad) {
        this.hitsAccuracy = HitsAccuracy.bad;
      } else {
        this.hitsAccuracy = HitsAccuracy.start;
      }
      this.hitsAccuracyWidth = Math.min((measure.hitsNumber / HitsAccuracyThreshold.accurate) * 100, 100);
    }
  }

  stopScan() {
    this.store.dispatch(new StartWatchPosition());
    this.subscriptions.push(
      this.actions$.pipe(ofActionSuccessful(PositionChanged)).subscribe(() => {
        this.store.dispatch(new StopMeasureScan());
        this.store.dispatch(new StopWatchPosition());
      })
    );
  }
}
