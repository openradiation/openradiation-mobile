import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { AbstractDevice } from '../../../states/devices/abstract-device';
import { DevicesState } from '../../../states/devices/devices.state';
import { DateService } from '../../../states/measures/date.service';
import {
  CancelMeasure,
  StartMeasure,
  StartWatchPosition,
  StopWatchPosition
} from '../../../states/measures/measures.action';
import { MeasuresStateModel } from '../../../states/measures/measures.state';

@Component({
  selector: 'app-measure-series',
  templateUrl: './measure-series.page.html',
  styleUrls: ['./measure-series.page.scss']
})
export class MeasureSeriesPage extends AutoUnsubscribePage {
  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice | undefined>;

  seriesMeasurementForm?: FormGroup;
  url = '/measure/series';

  constructor(
    protected router: Router,
    private store: Store,
    private navController: NavController,
    private actions$: Actions,
    private formBuilder: FormBuilder,
    private dateService: DateService
  ) {
    super(router);
  }

  pageEnter() {
    super.pageEnter();
    const { measureSeriesParams } = this.store.selectSnapshot(
      ({ measures }: { measures: MeasuresStateModel }) => measures
    );
    if (measureSeriesParams) {
      this.seriesMeasurementForm = this.formBuilder.group({
        ...measureSeriesParams.model
      });
    }
    this.store.dispatch(new StartWatchPosition());
    this.subscriptions.push(
      this.seriesMeasurementForm!.valueChanges.subscribe(value => {
        if (value.seriesDurationLimit) {
          this.seriesMeasurementForm!.get('seriesDurationLimit')!.setValue(
            this.dateService.toISODuration(value.seriesDurationLimit.hour.value * 60 * 60 * 1000)
          );
        }
        if (value.measureDurationLimit) {
          this.seriesMeasurementForm!.get('measureDurationLimit')!.setValue(
            this.dateService.toISODuration(value.measureDurationLimit.minutes.value * 60 * 1000)
          );
        }
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
      ),
      this.actions$
        .pipe(ofActionSuccessful(StartMeasure))
        .subscribe(() => this.navController.navigateRoot(['measure', 'scan']))
    );
  }

  pageLeave() {
    super.pageLeave();
    this.store.dispatch(new StopWatchPosition());
  }

  startMeasureSeries() {
    this.connectedDevice$.pipe(take(1)).subscribe(connectedDevice => {
      if (connectedDevice) {
        this.store.dispatch(new StartMeasure(connectedDevice));
      }
    });
  }

  cancelMeasureSeries() {
    this.store.dispatch(new CancelMeasure());
  }
}
