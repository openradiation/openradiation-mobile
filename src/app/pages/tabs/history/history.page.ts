import { Component, ElementRef } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Measure } from '../../../states/measures/measure';
import { DeleteAllMeasures, DeleteMeasure, PublishMeasure } from '../../../states/measures/measures.action';
import { MeasuresState } from '../../../states/measures/measures.state';
import { TranslateService } from '@ngx-translate/core';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { TabsService } from '../tabs.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss']
})
export class HistoryPage extends AutoUnsubscribePage {
  @Select(MeasuresState.measures)
  measures$: Observable<Measure[]>;

  measureBeingSentMap: { [K: string]: boolean } = {};

  constructor(
    protected tabsService: TabsService,
    protected elementRef: ElementRef,
    private store: Store,
    private alertController: AlertController,
    private translateService: TranslateService,
    private actions$: Actions
  ) {
    super(tabsService, elementRef);
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.subscriptions.push(
      this.actions$.pipe(ofActionDispatched(PublishMeasure)).subscribe((action: PublishMeasure) => {
        this.measureBeingSentMap[action.measure.reportUuid] = true;
      }),
      this.actions$
        .pipe(ofActionSuccessful(PublishMeasure))
        .subscribe((action: PublishMeasure) => (this.measureBeingSentMap[action.measure.reportUuid] = false))
    );
  }

  // TODO implement
  showDetail(measure: Measure) {}

  publish(measure: Measure) {
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

  delete(measure: Measure) {
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
