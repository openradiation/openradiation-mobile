import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { MeasuresState, MeasuresStateModel } from '../../../states/measures/measures.state';
import { Observable } from 'rxjs';
import { Measure } from '../../../states/measures/measure';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AutoUnsubscribePage } from '../../../components/page/auto-unsubscribe.page';
import { TabsService } from '../../tabs/tabs.service';
import { StopMeasure, StopMeasureReport } from '../../../states/measures/measures.action';

@Component({
  selector: 'app-measure-report',
  templateUrl: './measure-report.page.html',
  styleUrls: ['./measure-report.page.scss']
})
export class MeasureReportPage extends AutoUnsubscribePage {
  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure | undefined>;

  measureReportForm: FormGroup;

  constructor(
    protected tabsService: TabsService,
    protected elementRef: ElementRef,
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private actions$: Actions
  ) {
    super(tabsService, elementRef);

    const measureReport = this.store.selectSnapshot(
      ({ measures }: { measures: MeasuresStateModel }) => measures.measureReport
    );
    if (measureReport) {
      this.measureReportForm = this.formBuilder.group(measureReport.model);
    }
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.subscriptions.push(
      this.actions$.pipe(ofActionSuccessful(StopMeasureReport)).subscribe(() =>
        this.router.navigate([
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
    this.store.dispatch(new StopMeasureReport());
    this.subscriptions.push(
      this.actions$.pipe(ofActionSuccessful(StopMeasureReport)).subscribe(() => {
        this.store.dispatch(new StopMeasure());
      })
    );
  }
}
