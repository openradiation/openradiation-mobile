import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { NavController } from '@ionic/angular';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { AbstractDevice } from '../../../states/devices/abstract-device';
import { DevicesState } from '../../../states/devices/devices.state';
import {
  HitsAccuracy,
  HitsAccuracyThreshold,
  Measure,
  MeasureSeries,
  PositionAccuracyThreshold
} from '../../../states/measures/measure';
import { CancelMeasure, StartMeasureScan, StopMeasureScan } from '../../../states/measures/measures.action';
import { MeasuresState } from '../../../states/measures/measures.state';

@Component({
  selector: 'app-measure-scan',
  templateUrl: './measure-scan.page.html',
  styleUrls: ['./measure-scan.page.scss']
})
export class MeasureScanPage extends AutoUnsubscribePage {
  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure | undefined>;

  @Select(MeasuresState.currentSeries)
  currentSeries$: Observable<MeasureSeries | undefined>;

  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice | undefined>;

  hitsAccuracy: HitsAccuracy = HitsAccuracy.Start;
  hitsAccuracyThreshold = HitsAccuracyThreshold;
  hitsAccuracyWidth = 0;

  positionAccuracyThreshold = PositionAccuracyThreshold;

  canEndMeasureScan = false;
  isMeasureSeries = false;

  currentSeriesMessageMapping = {
    '=0': _('MEASURE_SERIES.MESSAGE_SCAN.NONE'),
    '=1': _('MEASURE_SERIES.MESSAGE_SCAN.SINGULAR'),
    other: _('MEASURE_SERIES.MESSAGE_SCAN.PLURAL')
  };

  url = '/measure/scan';

  constructor(
    protected router: Router,
    private store: Store,
    private navController: NavController,
    private actions$: Actions
  ) {
    super(router);
  }

  pageEnter() {
    super.pageEnter();
    this.currentSeries$.pipe(take(1)).subscribe(currentSeries => {
      this.isMeasureSeries = currentSeries !== undefined;
    });
    this.subscriptions.push(
      this.currentMeasure$.subscribe(measure => this.updateHitsAccuracy(measure)),
      this.currentSeries$.subscribe(currentSeries => {
        if (currentSeries && currentSeries.measures.length > 1) {
          this.canEndMeasureScan = true;
        }
      }),
      this.actions$.pipe(ofActionSuccessful(StopMeasureScan)).subscribe(() => {
        this.navController.navigateRoot(['measure', this.isMeasureSeries ? 'report-series' : 'report'], true);
      }),
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
      )
    );
    this.connectedDevice$.pipe(take(1)).subscribe(connectedDevice => {
      if (connectedDevice) {
        this.store.dispatch(new StartMeasureScan(connectedDevice)).subscribe();
      }
    });
  }

  updateHitsAccuracy(measure?: Measure) {
    if (measure && measure.hitsNumber !== undefined) {
      if (measure.hitsNumber >= HitsAccuracyThreshold.Accurate) {
        this.canEndMeasureScan = true;
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
    this.store.dispatch(new StopMeasureScan()).subscribe();
  }

  cancelMeasure() {
    this.store.dispatch(new CancelMeasure());
  }
}
