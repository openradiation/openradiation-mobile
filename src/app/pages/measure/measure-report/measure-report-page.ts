import { Component, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { SelectIconOption } from '../../../components/select-icon/select-icon-option';
import { DateService } from '../../../states/measures/date.service';
import { Measure, MeasureEnvironment } from '../../../states/measures/measure';
import {
  CancelMeasure,
  StartMeasureReport,
  StopMeasure,
  StopMeasureReport
} from '../../../states/measures/measures.action';
import { MeasuresState, MeasuresStateModel } from '../../../states/measures/measures.state';
import { UserState } from '../../../states/user/user.state';
import { TabsService } from '../../tabs/tabs.service';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';

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

  constructor(
    protected tabsService: TabsService,
    protected elementRef: ElementRef,
    private formBuilder: FormBuilder,
    private store: Store,
    private navController: NavController,
    private actions$: Actions,
    private activatedRoute: ActivatedRoute,
    private dateService: DateService
  ) {
    super(tabsService, elementRef);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.store.dispatch(new StartMeasureReport()).subscribe(() => {
      const measureReport = this.store.selectSnapshot(
        ({ measures }: { measures: MeasuresStateModel }) => measures.measureReport
      );
      this.activatedRoute.url.pipe(take(1)).subscribe(url => (this.reportScan = url[0].path === 'scan'));
      if (measureReport) {
        this.measureReportForm = this.formBuilder.group(measureReport.model);
      }
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
    });
  }

  stopReport() {
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
  }

  showMeasureSteps() {
    this.navController.navigateForward(['measure', 'report', 'steps']);
  }
}
