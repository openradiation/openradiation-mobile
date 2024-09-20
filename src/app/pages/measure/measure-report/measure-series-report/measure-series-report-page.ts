import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { AlertService } from '@app/services/alert.service';
import { NavigationService } from '@app/services/navigation.service';
import { MeasureEnvironment, MeasureSeries, MeasureSeriesParamsSelected } from '@app/states/measures/measure';
import {
  CancelMeasure,
  StartMeasureSeriesReport,
  StopMeasureSeries,
  StopMeasureSeriesReport
} from '@app/states/measures/measures.action';
import { MeasuresStateModel } from '@app/states/measures/measures.state';
import { AbstractMeasureReportPage } from '../abstact-measure-report.page';

@Component({
  selector: 'app-measure-series-report',
  templateUrl: './measure-series-report.page.html',
  styleUrls: ['./measure-series-report.page.scss']
})
export class MeasureSeriesReportPage extends AbstractMeasureReportPage<MeasureSeries> {
  currentSeries?: MeasureSeries;
  planeMode: boolean;
  measureSeriesParamsSelected = MeasureSeriesParamsSelected;

  exampleFlightNumber = { message: ': AF179' };
  exampleSeatNumber = { message: ': C15' };

  url = '/measure/report-series';

  constructor(
    protected router: Router,
    protected store: Store,
    protected activatedRoute: ActivatedRoute,
    protected navigationService: NavigationService,
    protected actions$: Actions,
    protected platform: Platform,
    private formBuilder: UntypedFormBuilder,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {
    super(router, store, activatedRoute, navigationService, actions$, platform);
  }

  pageEnter() {
    super.pageEnter();
    this.store.dispatch(new StartMeasureSeriesReport()).subscribe(() => {
      const { measureSeriesReport, currentSeries } = this.store.selectSnapshot(
        ({ measures }: { measures: MeasuresStateModel }) => measures
      );
      this.currentSeries = currentSeries;
      if (this.currentSeries) {
        this.planeMode = this.currentSeries.measures.some(
          measure => measure.measurementEnvironment === MeasureEnvironment.Plane
        );
        if (measureSeriesReport) {
          this.measureReportForm = this.formBuilder.group({
            ...measureSeriesReport.model,
            tags: [measureSeriesReport.model.tags]
          });
          if (!this.planeMode) {
            this.initPositionChangeAltitudeOverLimit(this.currentSeries);
            this.initMeasurementEnvironmentOptions(this.currentSeries);
          }
          if (this.currentSeries.sent) {
            if (!this.planeMode) {
              this.measureReportForm.get('measurementEnvironment')!.disable();
              this.measureReportForm.get('measurementHeight')!.disable();
              this.measureReportForm.get('rain')!.disable();
            } else {
              this.measureReportForm.get('storm')!.disable();
              this.measureReportForm.get('windowSeat')!.disable();
              this.measureReportForm.get('flightNumber')!.disable();
              this.measureReportForm.get('seatNumber')!.disable();
            }
            this.measureReportForm.get('description')!.disable();
            this.measureReportForm.get('tags')!.disable();
          }
        }
        this.init();
      }
    });
  }

  canPublish(measureSeries: MeasureSeries): boolean {
    return measureSeries.measures.some(measure => AbstractMeasureReportPage.canPublishSingleMeasure(measure));
  }

  initPositionChangeAltitudeOverLimit(measureSeries: MeasureSeries) {
    this.positionChangeAltitudeOverLimit = measureSeries.measures.some(measure =>
      AbstractMeasureReportPage.positionChangeAltitudeOverLimit(measure.altitude)
    );
  }

  stopReport() {
    this.subscriptions.push(
      this.actions$.pipe(ofActionSuccessful(StopMeasureSeriesReport)).subscribe(() => {
        this.store.dispatch(new StopMeasureSeries());
      })
    );
    this.store.dispatch(new StopMeasureSeriesReport());
  }

  cancelMeasure() {
    if (this.fromHistory) {
      super.cancelMeasure();
    } else {
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
    }
  }

  protected initMeasurementEnvironmentOptions(measureSeries: MeasureSeries) {
    this.positionChangeSpeedOverLimit = measureSeries.measures.some(measure =>
      AbstractMeasureReportPage.hasPositionChanged(measure)
    );
    this.updateMeasurementEnvironmentOptions();
  }
}
