import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { NavController } from '@ionic/angular';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { SelectIconOption } from '../../../components/select-icon/select-icon-option';
import { DateService } from '../../../states/measures/date.service';
import { Measure, MeasureEnvironment, PositionAccuracyThreshold } from '../../../states/measures/measure';
import {
  CancelMeasure,
  StartMeasureReport,
  StopMeasure,
  StopMeasureReport
} from '../../../states/measures/measures.action';
import { MeasuresState, MeasuresStateModel } from '../../../states/measures/measures.state';
import { UserState } from '../../../states/user/user.state';

@Component({
  selector: 'app-measure-report',
  templateUrl: './measure-report.page.html',
  styleUrls: ['./measure-report.page.scss']
})
export class MeasureReportPage extends AutoUnsubscribePage {
  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure | undefined>;

  @Select(MeasuresState.expertMode)
  expertMode$: Observable<boolean>;

  @Select(UserState.login)
  login$: Observable<string | undefined>;

  measureReportForm: FormGroup;
  reportScan = true;

  positionAccuracyThreshold = PositionAccuracyThreshold;

  url = '/measure/report';

  measurementEnvironmentOptions: SelectIconOption[] = [
    {
      iconOn: 'assets/img/icon-countryside-on.png',
      iconOff: 'assets/img/icon-countryside-off.png',
      label: <string>_('MEASURES.ENVIRONMENT.COUNTRYSIDE'),
      value: MeasureEnvironment.Countryside
    },
    {
      iconOn: 'assets/img/icon-ontheroad-on.png',
      iconOff: 'assets/img/icon-ontheroad-off.png',
      label: <string>_('MEASURES.ENVIRONMENT.ON_THE_ROAD'),
      value: MeasureEnvironment.OnTheRoad
    },
    {
      iconOn: 'assets/img/icon-city-on.png',
      iconOff: 'assets/img/icon-city-off.png',
      label: <string>_('MEASURES.ENVIRONMENT.CITY'),
      value: MeasureEnvironment.City
    },
    {
      iconOn: 'assets/img/icon-inside-on.png',
      iconOff: 'assets/img/icon-inside-off.png',
      label: <string>_('MEASURES.ENVIRONMENT.INSIDE'),
      value: MeasureEnvironment.Inside
    },
    {
      iconOn: 'assets/img/icon-plane-on.png',
      iconOff: 'assets/img/icon-plane-off.png',
      label: <string>_('MEASURES.ENVIRONMENT.PLANE'),
      value: MeasureEnvironment.Plane
    }
  ];

  measurementHeightOptions: SelectIconOption[] = [
    {
      iconOn: 'assets/img/icon-floor-on.png',
      iconOff: 'assets/img/icon-floor-off.png',
      label: <string>_('MEASURES.SENSOR_POSITION.FLOOR'),
      value: 0
    },
    {
      iconOn: 'assets/img/icon-elevated-on.png',
      iconOff: 'assets/img/icon-elevated-off.png',
      label: <string>_('MEASURES.SENSOR_POSITION.1_METER_HIGH'),
      value: 1
    }
  ];

  rainOptions: SelectIconOption[] = [
    {
      iconOn: 'assets/img/icon-sun-on.png',
      iconOff: 'assets/img/icon-sun-off.png',
      label: <string>_('MEASURES.WEATHER.NO_RAIN'),
      value: false
    },
    {
      iconOn: 'assets/img/icon-rain-on.png',
      iconOff: 'assets/img/icon-rain-off.png',
      label: <string>_('MEASURES.WEATHER.RAIN'),
      value: true
    }
  ];

  private initialized = false;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    private formBuilder: FormBuilder,
    private store: Store,
    private navController: NavController,
    private actions$: Actions,
    private dateService: DateService
  ) {
    super(router);
  }

  pageEnter() {
    if (!this.initialized) {
      super.pageEnter();
      this.store.dispatch(new StartMeasureReport()).subscribe(() => {
        const { measureReport, currentMeasure } = this.store.selectSnapshot(
          ({ measures }: { measures: MeasuresStateModel }) => measures
        );
        this.reportScan = !currentMeasure!.manualReporting;
        if (measureReport) {
          this.measureReportForm = this.formBuilder.group(measureReport.model);
        }
        this.init();
      });
      this.initialized = true;
    } else {
      this.init();
    }
  }

  init() {
    this.subscriptions.push(
      this.measureReportForm.valueChanges.subscribe(value => {
        if (typeof value.duration !== 'string' && value.duration) {
          this.measureReportForm
            .get('duration')!
            .setValue(
              this.dateService.toISODuration((value.duration.minute.value * 60 + value.duration.second.value) * 1000)
            );
        }
      }),
      this.actions$.pipe(ofActionSuccessful(StopMeasure, CancelMeasure)).subscribe(() =>
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
  }

  stopReport() {
    this.initialized = false;
    if (this.measureReportForm.valid) {
      this.subscriptions.push(
        this.actions$.pipe(ofActionSuccessful(StopMeasureReport)).subscribe(() => {
          this.store.dispatch(new StopMeasure());
        })
      );
      this.store.dispatch(new StopMeasureReport());
    }
  }

  cancelMeasure() {
    this.store.dispatch(new CancelMeasure());
    this.initialized = false;
  }

  showMeasureSteps() {
    this.navController.navigateForward(['measure', 'steps']);
  }
}
