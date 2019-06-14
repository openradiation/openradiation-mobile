import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { NavigationService } from '../../../services/navigation.service';
import { AbstractDevice } from '../../../states/devices/abstract-device';
import { DevicesState } from '../../../states/devices/devices.state';
import {
  HitsAccuracy,
  Measure,
  MeasureEnvironment,
  MeasureSeries,
  MeasureSeriesParamsSelected,
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

  @Select(MeasuresState.canEndCurrentScan)
  canEndCurrentScan$: Observable<boolean>;

  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice | undefined>;

  @Select(MeasuresState.planeMode)
  planeMode$: Observable<boolean>;

  hitsAccuracy: HitsAccuracy = HitsAccuracy.Start;
  hitsAccuracyWidth = 0;

  positionAccuracyThreshold = PositionAccuracyThreshold;
  measureSeriesParamsSelected = MeasureSeriesParamsSelected;

  isMeasureSeries = false;

  currentSeriesMessageMapping = {
    '=0': <string>_('MEASURE_SERIES.MESSAGE_SCAN.NONE'),
    '=1': <string>_('MEASURE_SERIES.MESSAGE_SCAN.SINGULAR'),
    other: <string>_('MEASURE_SERIES.MESSAGE_SCAN.PLURAL')
  };

  minuteMessageMapping = {
    '=0': <string>_('GENERAL.MINUTE.NONE'),
    '=1': <string>_('GENERAL.MINUTE.SINGULAR'),
    other: <string>_('GENERAL.MINUTE.PLURAL')
  };

  hourMessageMapping = {
    '=0': <string>_('GENERAL.HOUR.NONE'),
    '=1': <string>_('GENERAL.HOUR.SINGULAR'),
    other: <string>_('GENERAL.HOUR.PLURAL')
  };

  hitsMessageMapping = {
    '=0': <string>_('GENERAL.HITS.NONE'),
    '=1': <string>_('GENERAL.HITS.SINGULAR'),
    other: <string>_('GENERAL.HITS.PLURAL')
  };

  url = '/measure/scan';

  constructor(
    protected router: Router,
    private store: Store,
    private navigationService: NavigationService,
    private actions$: Actions
  ) {
    super(router);
  }

  pageEnter() {
    super.pageEnter();
    this.currentSeries$.pipe(take(1)).subscribe(currentSeries => {
      this.isMeasureSeries = currentSeries !== undefined;
    });
    this.connectedDevice$.pipe(take(1)).subscribe(connectedDevice => {
      if (connectedDevice) {
        this.subscriptions.push(
          this.currentMeasure$.subscribe(measure => this.updateHitsAccuracy(connectedDevice, measure)),
          this.actions$.pipe(ofActionSuccessful(StopMeasureScan)).subscribe(() => {
            this.navigationService.navigateRoot(['measure', this.isMeasureSeries ? 'report-series' : 'report']);
          }),
          this.actions$
            .pipe(ofActionSuccessful(CancelMeasure))
            .subscribe(() => this.navigationService.navigateRoot(['tabs', 'home']))
        );
        this.store.dispatch(new StartMeasureScan(connectedDevice)).subscribe();
      }
    });
  }

  updateHitsAccuracy(device: AbstractDevice, measure?: Measure) {
    if (measure && measure.hitsAccuracy !== undefined) {
      if (measure.hitsAccuracy >= device.hitsAccuracyThreshold.accurate) {
        this.hitsAccuracy = HitsAccuracy.Accurate;
      } else if (measure.hitsAccuracy >= device.hitsAccuracyThreshold.good) {
        this.hitsAccuracy = HitsAccuracy.Good;
      } else if (measure.hitsAccuracy >= device.hitsAccuracyThreshold.medium) {
        this.hitsAccuracy = HitsAccuracy.Medium;
      } else if (measure.hitsAccuracy >= device.hitsAccuracyThreshold.bad) {
        this.hitsAccuracy = HitsAccuracy.Bad;
      } else {
        this.hitsAccuracy = HitsAccuracy.Start;
      }
      this.hitsAccuracyWidth = Math.min((measure.hitsAccuracy / device.hitsAccuracyThreshold.accurate) * 100, 100);
    }
  }

  stopScan() {
    this.connectedDevice$.pipe(take(1)).subscribe(connectedDevice => {
      if (connectedDevice) {
        this.store.dispatch(new StopMeasureScan(connectedDevice)).subscribe();
      }
    });
  }

  cancelMeasure() {
    this.store.dispatch(new CancelMeasure());
  }
}
