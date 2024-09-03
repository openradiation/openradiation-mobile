import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '@app/components/auto-unsubscribe/auto-unsubscribe.page';
import { AlertService } from '@app/services/alert.service';
import { NavigationService } from '@app/services/navigation.service';
import { AbstractDevice } from '@app/states/devices/abstract-device';
import { DevicesState } from '@app/states/devices/devices.state';
import {
  HitsAccuracy,
  Measure,
  MeasureSeries,
  MeasureSeriesParamsSelected,
  PositionAccuracyThreshold
} from '@app/states/measures/measure';
import { CancelMeasure, StartMeasureScan, StopMeasureScan } from '@app/states/measures/measures.action';
import { MeasuresState } from '@app/states/measures/measures.state';

@Component({
  selector: 'app-measure-scan',
  templateUrl: './measure-scan.page.html',
  styleUrls: ['./measure-scan.page.scss']
})
export class MeasureScanPage extends AutoUnsubscribePage {
  currentMeasure$: Observable<Measure | undefined> = inject(Store).select(MeasuresState.currentMeasure);

  currentSeries$: Observable<MeasureSeries | undefined> = inject(Store).select(MeasuresState.currentSeries);

  canEndCurrentScan$: Observable<boolean> = inject(Store).select(MeasuresState.canEndCurrentScan);

  connectedDevice$: Observable<AbstractDevice | undefined> = inject(Store).select(DevicesState.connectedDevice);

  planeMode$: Observable<boolean> = inject(Store).select(MeasuresState.planeMode);

  hitsAccuracy: HitsAccuracy = HitsAccuracy.Start;
  hitsAccuracyWidth = 0;

  positionAccuracyThreshold = PositionAccuracyThreshold;
  measureSeriesParamsSelected = MeasureSeriesParamsSelected;

  isMeasureSeries = false;

  currentSeriesMessageMapping = {
    '=0': _('MEASURE_SERIES.MESSAGE_SCAN.NONE') as string,
    '=1': _('MEASURE_SERIES.MESSAGE_SCAN.SINGULAR') as string,
    other: _('MEASURE_SERIES.MESSAGE_SCAN.PLURAL') as string,
  };

  minuteMessageMapping = {
    '=0': _('GENERAL.MINUTE.NONE') as string,
    '=1': _('GENERAL.MINUTE.SINGULAR') as string,
    other: _('GENERAL.MINUTE.PLURAL') as string,
  };

  hourMessageMapping = {
    '=0': _('GENERAL.HOUR.NONE') as string,
    '=1': _('GENERAL.HOUR.SINGULAR') as string,
    other: _('GENERAL.HOUR.PLURAL') as string,
  };

  hitsMessageMapping = {
    '=0': _('GENERAL.HITS.NONE') as string,
    '=1': _('GENERAL.HITS.SINGULAR') as string,
    other: _('GENERAL.HITS.PLURAL') as string,
  };

  url = '/measure/scan';

  constructor(
    protected router: Router,
    private store: Store,
    private navigationService: NavigationService,
    private actions$: Actions,
    private alertService: AlertService,
    private translateService: TranslateService
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
    if (this.isMeasureSeries) {
      this.alertService.show({
        header: this.translateService.instant('GENERAL.CANCEL'),
        message: this.translateService.instant('MEASURE_SERIES.REPORT.CANCEL_CONFIRMATION'),
        backdropDismiss: false,
        buttons: [
          {
            text: this.translateService.instant('GENERAL.NO')
          },
          {
            text: this.translateService.instant('GENERAL.YES'),
            handler: () => this.store.dispatch(new CancelMeasure())
          }
        ]
      });
    } else {
      this.store.dispatch(new CancelMeasure());
    }
  }
}
