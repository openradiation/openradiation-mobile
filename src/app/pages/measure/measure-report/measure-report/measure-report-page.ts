import { Component, inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NavigationService } from '@app/services/navigation.service';
import { DateService } from '@app/states/measures/date.service';
import { Measure, MeasureEnvironment } from '@app/states/measures/measure';
import { StartMeasureReport, StopMeasure, StopMeasureReport } from '@app/states/measures/measures.action';
import { MeasuresState, MeasuresStateModel } from '@app/states/measures/measures.state';
import { AbstractMeasureReportPage } from '../abstact-measure-report.page';
import { MeasuresService } from '@app/states/measures/measures.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-measure-report',
  templateUrl: './measure-report.page.html',
  styleUrls: ['./measure-report.page.scss'],
})
export class MeasureReportPage extends AbstractMeasureReportPage<Measure> {
  expertMode$: Observable<boolean> = inject(Store).select(MeasuresState.expertMode);

  initialDatePickerValue: string;
  initialDurationValue: string;

  currentMeasure?: Measure;
  planeMode: boolean;
  inputDisabled = false;

  url = '/measure/report';

  constructor(
    protected router: Router,
    protected store: Store,
    protected activatedRoute: ActivatedRoute,
    protected navigationService: NavigationService,
    protected actions$: Actions,
    protected platform: Platform,
    private formBuilder: UntypedFormBuilder,
    private dateService: DateService,
    protected measureService: MeasuresService,
    protected translateService: TranslateService,
  ) {
    super(router, store, activatedRoute, navigationService, actions$, platform, measureService, translateService);
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    this.initialDatePickerValue = date.toISOString();
    this.initialDurationValue = this.dateService.toISODuration(0);
  }

  pageEnter() {
    super.pageEnter();
    if (!this.measureReportForm) {
      this.store.dispatch(new StartMeasureReport()).subscribe(() => {
        const { measureReport, currentMeasure } = this.store.selectSnapshot(
          ({ measures }: { measures: MeasuresStateModel }) => measures,
        );
        this.currentMeasure = currentMeasure;
        if (this.currentMeasure) {
          this.reportScan = !this.currentMeasure.manualReporting;
          this.inputDisabled = this.reportScan || this.currentMeasure.sent;
          this.planeMode = this.currentMeasure.measurementEnvironment === MeasureEnvironment.Plane;
          if (measureReport) {
            this.measureReportForm = this.formBuilder.group({
              ...measureReport.model,
              tags: [measureReport.model.tags],
            });
            if (!this.planeMode) {
              this.initPositionChangeAltitudeOverLimit(this.currentMeasure);
              this.initMeasurementEnvironmentOptions(this.currentMeasure);
            }
            if (this.currentMeasure.sent) {
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
              this.measureReportForm.get('enclosedObject')!.disable();
            }
          }
        }
      });
    }
    this.init();
  }

  init() {
    this.subscriptions.push(
      this.measureReportForm!.valueChanges.subscribe((value) => {
        if (value.duration === undefined) {
          //si duration est undefined, le date picker se met à new Date(), on le force à 00h00m00s
          this.measureReportForm!.get('duration')!.setValue(this.initialDurationValue);
        } else if (typeof value.duration !== 'string' && value.duration) {
          this.measureReportForm!.get('duration')!.setValue(
            this.dateService.toISODuration(
              (value.duration.hour.value * 60 * 60 + value.duration.minute.value * 60 + value.duration.second.value) *
                1000,
            ),
          );
        }
      }),
    );
    super.init();
  }

  stopReport() {
    if (this.measureReportForm!.valid) {
      this.subscriptions.push(
        this.actions$.pipe(ofActionSuccessful(StopMeasureReport)).subscribe(() => {
          this.store.dispatch(new StopMeasure());
        }),
      );
      this.store.dispatch(new StopMeasureReport());
    }
  }

  showMeasureSteps() {
    this.navigationService.navigateForward(['measure', 'steps']);
  }

  canPublish(measure: Measure): boolean {
    return this.measureService.canPublishMeasure(measure);
  }

  protected initMeasurementEnvironmentOptions(measure: Measure) {
    this.positionChangeSpeedOverLimit = AbstractMeasureReportPage.hasPositionChanged(measure);
    this.updateMeasurementEnvironmentOptions();
  }

  protected initPositionChangeAltitudeOverLimit(measure: Measure) {
    this.positionChangeAltitudeOverLimit = AbstractMeasureReportPage.positionChangeAltitudeOverLimit(measure.altitude);
  }
}
