import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionDispatched, ofActionErrored, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { Measure, MeasureSeries, PositionAccuracyThreshold } from '../../../states/measures/measure';
import {
  DeleteAllMeasures,
  DeleteMeasure,
  PublishMeasure,
  ShowMeasure
} from '../../../states/measures/measures.action';
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
  positionAccuracyThreshold = PositionAccuracyThreshold;
  url = '/tabs/(history:history)';
  constructor(
    protected router: Router,
    private store: Store,
    private alertController: AlertController,
    private translateService: TranslateService,
    private actions$: Actions,
    private toastController: ToastController,
    private navController: NavController
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
      this.actions$.pipe(ofActionSuccessful(ShowMeasure)).subscribe(() =>
        this.navController.navigateRoot(['measure', 'report'], true, {
          queryParams: { goBackHistory: true }
        })
      )
    );
  }

  showDetail(measure: Measure) {
    this.store.dispatch(new ShowMeasure(measure));
  }

  publish(event: Event, measure: Measure) {
    event.stopPropagation();
    if (
      measure.accuracy &&
      measure.accuracy < PositionAccuracyThreshold.Inaccurate &&
      (measure.endAccuracy && measure.endAccuracy < PositionAccuracyThreshold.Inaccurate)
    ) {
      this.alertController
        .create({
          header: this.translateService.instant('HISTORY.TITLE'),
          subHeader: this.translateService.instant('HISTORY.SEND.TITLE'),
          message: this.translateService.instant('HISTORY.SEND.NOTICE'),
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
        })
        .then(alert => alert.present());
    }
  }

  delete(event: Event, measure: Measure) {
    event.stopPropagation();
    this.alertController
      .create({
        header: this.translateService.instant('HISTORY.TITLE'),
        message: this.translateService.instant('HISTORY.DELETE.NOTICE'),
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
      })
      .then(alert => alert.present());
  }

  deleteAll() {
    this.alertController
      .create({
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
      })
      .then(alert => alert.present());
  }
}
