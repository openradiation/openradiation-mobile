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
import { PositionAccuracyThreshold } from '../../../states/measures/measure';
import { CancelMeasure, StartMeasure, StopMeasureSeriesParams } from '../../../states/measures/measures.action';
import { MeasuresState, MeasuresStateModel } from '../../../states/measures/measures.state';

@Component({
  selector: 'app-measure-series',
  templateUrl: './measure-series.page.html',
  styleUrls: ['./measure-series.page.scss']
})
export class MeasureSeriesPage extends AutoUnsubscribePage {
  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice | undefined>;

  @Select(MeasuresState.positionAccuracy)
  positionAccuracy$: Observable<number>;

  measureSeriesParamsForm?: FormGroup;
  url = '/measure/series';
  positionAccuracyThreshold = PositionAccuracyThreshold;

  constructor(
    protected router: Router,
    private store: Store,
    private navController: NavController,
    private actions$: Actions,
    private formBuilder: FormBuilder
  ) {
    super(router);
  }

  pageEnter() {
    super.pageEnter();
    const { measureSeriesParams } = this.store.selectSnapshot(
      ({ measures }: { measures: MeasuresStateModel }) => measures
    );
    if (measureSeriesParams) {
      this.measureSeriesParamsForm = this.formBuilder.group({
        ...measureSeriesParams.model
      });
    }
    this.subscriptions.push(
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

  startMeasureSeries() {
    this.connectedDevice$.pipe(take(1)).subscribe(connectedDevice => {
      if (connectedDevice) {
        this.store
          .dispatch(new StopMeasureSeriesParams())
          .subscribe(() => this.store.dispatch(new StartMeasure(connectedDevice)));
      }
    });
  }

  cancelMeasureSeries() {
    this.store.dispatch(new CancelMeasure());
  }
}
