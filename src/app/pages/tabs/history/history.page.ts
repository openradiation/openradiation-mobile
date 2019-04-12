import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionDispatched, ofActionErrored, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { AlertService } from '../../../services/alert.service';
import { NavigationService } from '../../../services/navigation.service';
import { Measure, MeasureSeries, MeasureType } from '../../../states/measures/measure';
import {
  DeleteAllMeasures,
  DeleteMeasure,
  PublishMeasure,
  ShowMeasure
} from '../../../states/measures/measures.action';
import { MeasuresService } from '../../../states/measures/measures.service';
import { MeasuresState } from '../../../states/measures/measures.state';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss']
})
export class HistoryPage extends AutoUnsubscribePage {
  @Select(MeasuresState.measures)
  measures$: Observable<(Measure | MeasureSeries)[]>;

  measureBeingSentMap: { [K: string]: boolean } = {};

  url = '/tabs/history';

  constructor(
    protected router: Router,
    private store: Store,
    private alertService: AlertService,
    private translateService: TranslateService,
    private actions$: Actions,
    private toastController: ToastController,
    private navigationService: NavigationService
  ) {
    super(router);
  }

  pageEnter() {
    super.pageEnter();
    this.subscriptions.push(
      this.actions$.pipe(ofActionErrored(PublishMeasure)).subscribe(({ measure }: PublishMeasure) => {
        this.measureBeingSentMap[measure.id] = false;
        this.toastController
          .create({
            message: this.translateService.instant('HISTORY.SEND_ERROR'),
            showCloseButton: true,
            duration: 3000,
            closeButtonText: this.translateService.instant('GENERAL.OK')
          })
          .then(toast => toast.present());
      }),
      this.actions$.pipe(ofActionDispatched(PublishMeasure)).subscribe(({ measure }: PublishMeasure) => {
        this.measureBeingSentMap[measure.id] = true;
      }),
      this.actions$
        .pipe(ofActionSuccessful(PublishMeasure))
        .subscribe(({ measure }: PublishMeasure) => (this.measureBeingSentMap[measure.id] = false)),
      this.actions$.pipe(ofActionSuccessful(ShowMeasure)).subscribe(action => {
        this.navigationService.navigateForward(
          ['measure', action.measure.type === MeasureType.Measure ? 'report' : 'report-series'],
          true,
          {
            queryParams: { goBackHistory: true }
          }
        );
      })
    );
  }

  showDetail(measure: Measure) {
    this.store.dispatch(new ShowMeasure(measure));
  }

  publish(measure: Measure | MeasureSeries) {
    if (this.canPublish(measure)) {
      this.alertService.show({
        header: this.translateService.instant('HISTORY.TITLE'),
        subHeader:
          measure.type === MeasureType.Measure
            ? this.translateService.instant('HISTORY.SEND.TITLE')
            : this.translateService.instant('HISTORY.SEND_SERIES.TITLE'),
        message:
          measure.type === MeasureType.Measure
            ? this.translateService.instant('HISTORY.SEND.NOTICE')
            : this.translateService.instant('HISTORY.SEND_SERIES.NOTICE'),
        backdropDismiss: false,
        buttons: [
          {
            text: this.translateService.instant('GENERAL.NO')
          },
          {
            text: this.translateService.instant('GENERAL.YES'),
            handler: () => this.store.dispatch(new PublishMeasure(measure))
          }
        ]
      });
    }
  }

  canPublish(measure: Measure | MeasureSeries): boolean {
    return MeasuresService.canPublishMeasure(measure);
  }

  containsMeasureSeries(measures: (Measure | MeasureSeries)[]): boolean {
    return measures.some(measure => measure.type === MeasureType.MeasureSeries);
  }

  delete(measure: Measure | MeasureSeries) {
    this.alertService.show({
      header: this.translateService.instant('HISTORY.TITLE'),
      message:
        measure.type === MeasureType.Measure
          ? this.translateService.instant('HISTORY.DELETE.NOTICE')
          : this.translateService.instant('HISTORY.DELETE_SERIES.NOTICE'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translateService.instant('GENERAL.NO')
        },
        {
          text: this.translateService.instant('GENERAL.YES'),
          handler: () => this.store.dispatch(new DeleteMeasure(measure))
        }
      ]
    });
  }

  deleteAll() {
    this.alertService.show({
      header: this.translateService.instant('HISTORY.TITLE'),
      subHeader: this.translateService.instant('HISTORY.DELETE_ALL.TITLE'),
      message: this.translateService.instant('HISTORY.DELETE_ALL.NOTICE'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translateService.instant('GENERAL.NO')
        },
        {
          text: this.translateService.instant('GENERAL.YES'),
          handler: () => this.store.dispatch(new DeleteAllMeasures())
        }
      ]
    });
  }
}
