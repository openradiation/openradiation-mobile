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
import { HitsAccuracy, Measure, MeasureSeries, PositionAccuracyThreshold } from '../../../states/measures/measure';
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
          this.currentSeries$.subscribe(currentSeries => {
            if (currentSeries && currentSeries.measures.length > 1) {
              this.canEndMeasureScan = true;
            }
          }),
          this.actions$.pipe(ofActionSuccessful(StopMeasureScan)).subscribe(() => {
            this.navigationService.navigateRoot(['measure', this.isMeasureSeries ? 'report-series' : 'report']);
          }),
          this.actions$.pipe(ofActionSuccessful(CancelMeasure)).subscribe(() =>
            this.navigationService.navigateRoot([
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
        this.store.dispatch(new StartMeasureScan(connectedDevice)).subscribe();
      }
    });
  }

  updateHitsAccuracy(device: AbstractDevice, measure?: Measure) {
    if (measure && measure.hitsNumber !== undefined) {
      if (measure.hitsNumber >= device.hitsAccuracyThreshold.accurate) {
        this.canEndMeasureScan = true;
        this.hitsAccuracy = HitsAccuracy.Accurate;
      } else if (measure.hitsNumber >= device.hitsAccuracyThreshold.good) {
        this.hitsAccuracy = HitsAccuracy.Good;
      } else if (measure.hitsNumber >= device.hitsAccuracyThreshold.medium) {
        this.hitsAccuracy = HitsAccuracy.Medium;
      } else if (measure.hitsNumber >= device.hitsAccuracyThreshold.bad) {
        this.hitsAccuracy = HitsAccuracy.Bad;
      } else {
        this.hitsAccuracy = HitsAccuracy.Start;
      }
      this.hitsAccuracyWidth = Math.min((measure.hitsNumber / device.hitsAccuracyThreshold.accurate) * 100, 100);
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
