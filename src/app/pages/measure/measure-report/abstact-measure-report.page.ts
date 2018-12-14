import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { Platform } from '@ionic/angular';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { SelectIconOption } from '../../../components/select-icon/select-icon-option';
import { NavigationService } from '../../../services/navigation.service';
import {
  AbstractMeasure,
  Measure,
  MeasureEnvironment,
  PositionAccuracyThreshold
} from '../../../states/measures/measure';
import { AddRecentTag, CancelMeasure, StopMeasure, StopMeasureSeries } from '../../../states/measures/measures.action';
import { MeasuresState } from '../../../states/measures/measures.state';
import { UserState } from '../../../states/user/user.state';

export abstract class AbstractMeasureReportPage<T extends AbstractMeasure> extends AutoUnsubscribePage {
  @Select(UserState.login)
  login$: Observable<string | undefined>;

  @Select(MeasuresState.recentTags)
  recentTags$: Observable<string>;

  measureReportForm?: FormGroup;
  reportScan = true;
  positionChangeSpeedOverLimit = false;

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

  protected constructor(
    protected router: Router,
    protected store: Store,
    protected activatedRoute: ActivatedRoute,
    protected navigationService: NavigationService,
    protected actions$: Actions,
    protected platform: Platform
  ) {
    super(router);
  }

  init() {
    this.subscriptions.push(
      this.actions$.pipe(ofActionSuccessful(StopMeasureSeries, CancelMeasure, StopMeasure)).subscribe(() => {
        this.activatedRoute.queryParams.pipe(take(1)).subscribe(queryParams => {
          this.measureReportForm = undefined;
          if (queryParams.goBackHistory) {
            this.navigationService.goBack();
          } else {
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
            ]);
          }
        });
      }),
      this.platform.backButton.subscribeWithPriority(9999, () => {
        this.cancelMeasure();
      })
    );
  }

  cancelMeasure() {
    this.store.dispatch(new CancelMeasure());
  }

  protected updateMeasurementEnvironmentOptions() {
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

  protected static hasPositionChanged(measure: Measure): boolean {
    const lat = measure!.latitude;
    const long = measure!.longitude;
    const endLat = measure!.endLatitude;
    const endLong = measure!.endLongitude;
    const duration = (measure!.endTime! + 5000 - measure!.startTime) / 60000;
    if (lat !== undefined && long !== undefined && endLat !== undefined && endLong !== undefined && duration > 0) {
      return AbstractMeasureReportPage.checkPositionChangeSpeed(lat, long, endLat, endLong, duration);
    } else {
      return false;
    }
  }

  private static checkPositionChangeSpeed(
    lat: number,
    long: number,
    endLat: number,
    endLong: number,
    duration: number
  ): boolean {
    let speed;
    const distance = AbstractMeasureReportPage.getDistance(lat, long, endLat, endLong);
    if (distance > 0) {
      speed = (distance * 60) / duration;
    } else {
      return false;
    }
    return speed > 25;
  }

  private static getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

  tagAdded(tag: string) {
    this.store.dispatch(new AddRecentTag(tag));
  }

  abstract canPublish(measure: T): boolean;

  protected static canPublishSingleMeasure(measure: Measure): boolean {
    return (
      measure.accuracy !== undefined &&
      measure.accuracy !== null &&
      measure.accuracy < PositionAccuracyThreshold.No &&
      measure.endAccuracy !== undefined &&
      measure.endAccuracy !== null &&
      measure.endAccuracy < PositionAccuracyThreshold.No
    );
  }

  protected abstract initMeasurementEnvironmentOptions(measure: T): void;
}
