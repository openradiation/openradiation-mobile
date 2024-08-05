import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '@app/components/auto-unsubscribe/auto-unsubscribe.page';
import { NavigationService } from '@app/services/navigation.service';
import { AbstractDevice } from '@app/states/devices/abstract-device';
import { DevicesState } from '@app/states/devices/devices.state';
import { MeasureSeriesParamsSelected } from '@app/states/measures/measure';
import { CancelMeasure, StartMeasure, StopMeasureSeriesParams } from '@app/states/measures/measures.action';
import { MeasuresState, MeasuresStateModel } from '@app/states/measures/measures.state';

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

  measureSeriesParamsForm?: UntypedFormGroup;
  url = '/measure/series';
  measureSeriesParamsSelected = MeasureSeriesParamsSelected;

  minuteMessageMapping = {
    '=0': _('GENERAL.MINUTE.NONE') as string,
    '=1': _('GENERAL.MINUTE.SINGULAR') as string,
    other: _('GENERAL.MINUTE.PLURAL') as string,
  };

  hourMessageMapping = {
    '=0': _('GENERAL.HOUR.NONE') as string,
    '=1': _('GENERAL.HOUR.SINGULAR') as string,
    other: _('GENERAL.HOUR.PLURAL') as string,
  };

  hitsMessageMapping = {
    '=0': _('GENERAL.HITS.NONE') as string,
    '=1': _('GENERAL.HITS.SINGULAR') as string,
    other: _('GENERAL.HITS.PLURAL') as string,
  };

  private paramSelected: MeasureSeriesParamsSelected;

  constructor(
    protected router: Router,
    private store: Store,
    private navigationService: NavigationService,
    private actions$: Actions,
    private formBuilder: UntypedFormBuilder
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
      // @ts-expect-error no-prototype-builtins : we do check for tagName presence before accessing it
      if (value.target && Object.prototype.hasOwnProperty.call(value.target, 'tagName') && value.target.tagName.toLowerCase() === 'ion-radio-group') {
        this.paramSelected = this.measureSeriesParamsForm.value.paramSelected;
      } else {
        this.measureSeriesParamsForm.get('paramSelected')!.setValue(this.paramSelected);
      }
    }
  }
}
