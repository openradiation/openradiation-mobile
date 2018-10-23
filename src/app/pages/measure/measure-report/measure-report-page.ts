import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { NavController } from '@ionic/angular';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
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

  measureReportForm?: FormGroup;
  reportScan = true;
  positionChangeSpeedOverLimit = false;

  positionAccuracyThreshold = PositionAccuracyThreshold;

  url = '/measure/report';

  measurementEnvironmentOptions: SelectIconOption[];

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
    super.pageEnter();
    this.store.dispatch(new StartMeasureReport()).subscribe(() => {
      const { measureReport, currentMeasure } = this.store.selectSnapshot(
        ({ measures }: { measures: MeasuresStateModel }) => measures
      );
      this.reportScan = !currentMeasure!.manualReporting;
      this.initMeasurementEnvironmentOptions(currentMeasure);
      if (measureReport) {
        this.measureReportForm = this.formBuilder.group({ ...measureReport.model, tags: [measureReport.model.tags] });
        if (currentMeasure!.sent) {
          this.measureReportForm.get('measurementEnvironment')!.disable();
          this.measureReportForm.get('measurementHeight')!.disable();
          this.measureReportForm.get('rain')!.disable();
          this.measureReportForm.get('description')!.disable();
          this.measureReportForm.get('tags')!.disable();
          this.measureReportForm.get('enclosedObject')!.disable();
        }
      }
      this.init();
    });
  }

  init() {
    this.subscriptions.push(
      this.measureReportForm!.valueChanges.subscribe(value => {
        if (typeof value.duration !== 'string' && value.duration) {
          this.measureReportForm!.get('duration')!.setValue(
            this.dateService.toISODuration(
              (value.duration.hour.value * 60 * 60 + value.duration.minute.value * 60 + value.duration.second.value) *
                1000
            )
          );
        }
      }),
      this.actions$.pipe(ofActionSuccessful(StopMeasure, CancelMeasure)).subscribe(() => {
        this.activatedRoute.queryParams.pipe(take(1)).subscribe(queryParams => {
          this.measureReportForm = undefined;
          if (queryParams.goBackHistory) {
            this.navController.navigateRoot([
              'tabs',
              {
                outlets: {
                  home: null,
                  history: 'history',
                  settings: null,
                  map: null,
                  other: null
                }
              }
            ]);
          } else {
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
            ]);
          }
        });
      })
    );
  }

  stopReport() {
    if (this.measureReportForm!.valid) {
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
    this.navController.navigateForward(['measure', 'steps']);
  }

  initMeasurementEnvironmentOptions(currentMeasure: any) {
    const lat = currentMeasure!.latitude;
    const long = currentMeasure!.longitude;
    const endLat = currentMeasure!.endLatitude;
    const endLong = currentMeasure!.endLongitude;
    const duration = (currentMeasure!.endTime! - currentMeasure!.startTime) / 60000;
    if (lat !== undefined && long !== undefined && endLat !== undefined && endLong !== undefined && duration > 0) {
      this.positionChangeSpeedOverLimit = MeasureReportPage.checkPositionChangeSpeed(
        lat,
        long,
        endLat,
        endLong,
        duration
      );
    }
    this.measurementEnvironmentOptions = [
      {
        iconOn: 'assets/img/icon-countryside-on.png',
        iconOff: 'assets/img/icon-countryside-off.png',
        label: <string>_('MEASURES.ENVIRONMENT.COUNTRYSIDE'),
        value: MeasureEnvironment.Countryside,
        disabled: this.positionChangeSpeedOverLimit
      },
      {
        iconOn: 'assets/img/icon-city-on.png',
        iconOff: 'assets/img/icon-city-off.png',
        label: <string>_('MEASURES.ENVIRONMENT.CITY'),
        value: MeasureEnvironment.City,
        disabled: this.positionChangeSpeedOverLimit
      },
      {
        iconOn: 'assets/img/icon-inside-on.png',
        iconOff: 'assets/img/icon-inside-off.png',
        label: <string>_('MEASURES.ENVIRONMENT.INSIDE'),
        value: MeasureEnvironment.Inside,
        disabled: this.positionChangeSpeedOverLimit
      },
      {
        iconOn: 'assets/img/icon-ontheroad-on.png',
        iconOff: 'assets/img/icon-ontheroad-off.png',
        label: <string>_('MEASURES.ENVIRONMENT.ON_THE_ROAD'),
        value: MeasureEnvironment.OnTheRoad
      },
      {
        iconOn: 'assets/img/icon-plane-on.png',
        iconOff: 'assets/img/icon-plane-off.png',
        label: <string>_('MEASURES.ENVIRONMENT.PLANE'),
        value: MeasureEnvironment.Plane
      }
    ];
  }

  static checkPositionChangeSpeed(lat: number, long: number, endLat: number, endLong: number, duration: number) {
    let speed;
    const distance = MeasureReportPage.getDistance(lat, long, endLat, endLong);
    console.log('istance ' + distance);
    if (distance > 0) {
      speed = (distance * 60) / duration;
    } else {
      return false;
    }
    return speed > 30;
  }

  static getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const earth_radius = 6378137;
    const rlo1 = (Math.PI * lng1) / 180;
    const rla1 = (Math.PI * lat1) / 180;
    const rlo2 = (Math.PI * lng2) / 180;
    const rla2 = (Math.PI * lat2) / 180;
    const dlo = (rlo2 - rlo1) / 2;
    const dla = (rla2 - rla1) / 2;
    const a = Math.sin(dla) * Math.sin(dla) + Math.cos(rla1) * Math.cos(rla2) * (Math.sin(dlo) * Math.sin(dlo));
    const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (earth_radius * d) / 1000;
  }
}
