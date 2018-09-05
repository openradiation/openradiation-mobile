import { Component, ElementRef } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { AbstractDevice } from '../../../states/devices/abstract-device';
import { DevicesState } from '../../../states/devices/devices.state';
import { HitsAccuracy, HitsAccuracyThreshold, Measure } from '../../../states/measures/measure';
import {
  CancelMeasure,
  PositionChanged,
  StartMeasureScan,
  StartWatchPosition,
  StopMeasureScan,
  StopWatchPosition
} from '../../../states/measures/measures.action';
import { MeasuresState } from '../../../states/measures/measures.state';
import { TabsService } from '../../tabs/tabs.service';

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

  hitsAccuracy: HitsAccuracy = HitsAccuracy.Start;
  hitsAccuracyThreshold = HitsAccuracyThreshold;
  hitsAccuracyWidth = 0;

  constructor(
    protected tabsService: TabsService,
    protected elementRef: ElementRef,
    private store: Store,
    private navController: NavController,
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
        .subscribe(() => this.navController.navigateForward(['measure', 'report', 'scan']))
    );
    this.connectedDevice$.pipe(take(1)).subscribe(connectedDevice => {
      if (connectedDevice) {
        this.store.dispatch(new StartMeasureScan(connectedDevice)).subscribe();
      }
    });
    this.actions$.pipe(ofActionSuccessful(CancelMeasure)).subscribe(() =>
      this.navController.navigateRoot([
        'tabs',
        {
          outlets: {
            home: 'home',
            history: null,
            settings: null,
            map: null,
            other: null
          }
        }
      ])
    );
  }

  updateHitsAccuracy(measure?: Measure) {
    if (measure) {
      if (measure.hitsNumber >= HitsAccuracyThreshold.Accurate) {
        this.hitsAccuracy = HitsAccuracy.Accurate;
      } else if (measure.hitsNumber >= HitsAccuracyThreshold.Good) {
        this.hitsAccuracy = HitsAccuracy.Good;
      } else if (measure.hitsNumber >= HitsAccuracyThreshold.Medium) {
        this.hitsAccuracy = HitsAccuracy.Medium;
      } else if (measure.hitsNumber >= HitsAccuracyThreshold.Bad) {
        this.hitsAccuracy = HitsAccuracy.Bad;
      } else {
        this.hitsAccuracy = HitsAccuracy.Start;
      }
      this.hitsAccuracyWidth = Math.min((measure.hitsNumber / HitsAccuracyThreshold.Accurate) * 100, 100);
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

  cancelMeasure() {
    this.store.dispatch(new CancelMeasure());
  }
}
