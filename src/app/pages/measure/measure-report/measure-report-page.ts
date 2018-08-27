import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { MeasuresState } from '../../../states/measures/measures.state';
import { Observable } from 'rxjs';
import { Measure, MeasureReport } from '../../../states/measures/measure';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AutoUnsubscribePage } from '../../../components/page/auto-unsubscribe.page';
import { TabsService } from '../../tabs/tabs.service';
import { StopMeasure, StopMeasureReport } from '../../../states/measures/measures.action';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-measure-report',
  templateUrl: './measure-report.page.html',
  styleUrls: ['./measure-report.page.scss']
})
export class MeasureReportPage extends AutoUnsubscribePage {
  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure | undefined>;

  measureReportForm: FormGroup;
  reportScan = true;

  constructor(
    protected tabsService: TabsService,
    protected elementRef: ElementRef,
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private actions$: Actions,
    private activatedRoute: ActivatedRoute
  ) {
    super(tabsService, elementRef);

    /*const measureReport = this.store.selectSnapshot(
      ({ measures }: { measures: MeasuresStateModel }) => measures.measureReport
    );*/
    this.activatedRoute.url.pipe(take(1)).subscribe(url => (this.reportScan = url[0].path === 'scan'));
    const duration = new Date();
    duration.setUTCMinutes(3);
    duration.setUTCSeconds(29);
    const startTime = new Date().toISOString();
    const measureReport: {
      model: MeasureReport;
      dirty: boolean;
      status: string;
      errors: any;
    } = {
      model: this.reportScan
        ? {
            latitude: 48.7939052,
            longitude: 2.2768106,
            endLatitude: 48.7939052,
            endLongitude: 2.2768106,
            date: startTime,
            startTime: startTime,
            duration: duration.toISOString(),
            temperature: 31,
            hitsNumber: 52,
            value: 0.042
          }
        : {
            latitude: 48.7939052,
            longitude: 2.2768106,
            endLatitude: 48.7939052,
            endLongitude: 2.2768106,
            date: startTime,
            startTime: startTime,
            duration: undefined,
            temperature: undefined,
            hitsNumber: undefined,
            value: undefined
          },
      dirty: false,
      status: '',
      errors: {}
    };
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
    if (this.measureReportForm.valid) {
      this.store.dispatch(new StopMeasureReport());
      this.subscriptions.push(
        this.actions$.pipe(ofActionSuccessful(StopMeasureReport)).subscribe(() => {
          this.store.dispatch(new StopMeasure());
        })
      );
    }
  }
}
