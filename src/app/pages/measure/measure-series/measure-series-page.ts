import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { Measure } from '../../../states/measures/measure';
import { MeasuresState, MeasuresStateModel } from '../../../states/measures/measures.state';
import { CancelSeriesMeasure } from '../../../states/measures/measures.action';
import { NavController } from '@ionic/angular';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-measure-series',
  templateUrl: './measure-series.page.html',
  styleUrls: ['./measure-series.page.scss']
})
export class MeasureSeriesPage extends AutoUnsubscribePage {
  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure | undefined>;

  seriesMeasurementForm?: FormGroup;
  url = '/measure/series';

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
    const { measurementSeries, currentMeasure } = this.store.selectSnapshot(
      ({ measures }: { measures: MeasuresStateModel }) => measures
    );
    if (measurementSeries) {
      this.seriesMeasurementForm = this.formBuilder.group({
        ...measurementSeries.model
      });
    }
    this.subscriptions.push(
      this.actions$.pipe(ofActionSuccessful(CancelSeriesMeasure)).subscribe(() =>
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

  cancelSeriesMeasure() {
    this.store.dispatch(new CancelSeriesMeasure());
  }

  startSeriesMeasure() {}
}
