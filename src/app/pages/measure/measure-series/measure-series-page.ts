import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { NavigationService } from '../../../services/navigation.service';
import { AbstractDevice } from '../../../states/devices/abstract-device';
import { DevicesState } from '../../../states/devices/devices.state';
import { MeasureSeriesParamsSelected } from '../../../states/measures/measure';
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

  @Select(MeasuresState.planeMode)
  planeMode$: Observable<boolean>;

  measureSeriesParamsForm?: FormGroup;
  url = '/measure/series';
  measureSeriesParamsSelected = MeasureSeriesParamsSelected;

  minuteMessageMapping = {
    '=0': <string>_('GENERAL.MINUTE.NONE'),
    '=1': <string>_('GENERAL.MINUTE.SINGULAR'),
    other: <string>_('GENERAL.MINUTE.PLURAL')
  };

  hourMessageMapping = {
    '=0': <string>_('GENERAL.HOUR.NONE'),
    '=1': <string>_('GENERAL.HOUR.SINGULAR'),
    other: <string>_('GENERAL.HOUR.PLURAL')
  };

  hitsMessageMapping = {
    '=0': <string>_('GENERAL.HITS.NONE'),
    '=1': <string>_('GENERAL.HITS.SINGULAR'),
    other: <string>_('GENERAL.HITS.PLURAL')
  };

  private paramSelected: MeasureSeriesParamsSelected;

  constructor(
    protected router: Router,
    private store: Store,
    private navigationService: NavigationService,
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
      this.paramSelected = measureSeriesParams.model.paramSelected;
      this.measureSeriesParamsForm = this.formBuilder.group({
        ...measureSeriesParams.model
      });
    }
    this.subscriptions.push(
      this.actions$
        .pipe(ofActionSuccessful(CancelMeasure))
        .subscribe(() => this.navigationService.navigateRoot(['tabs', 'home'])),
      this.actions$
        .pipe(ofActionSuccessful(StartMeasure))
        .subscribe(() => this.navigationService.navigateRoot(['measure', 'scan']))
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

  onParamSelectedChange(value: CustomEvent) {
    if (this.measureSeriesParamsForm) {
      if (value.srcElement && value.srcElement.tagName.toLowerCase() === 'ion-radio-group') {
        this.paramSelected = this.measureSeriesParamsForm.value.paramSelected;
      } else {
        this.measureSeriesParamsForm.get('paramSelected')!.setValue(this.paramSelected);
      }
    }
  }
}
