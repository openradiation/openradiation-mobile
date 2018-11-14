import { Component, OnInit } from '@angular/core';
import { Measure, MeasureSeries, MeasureType, PositionAccuracyThreshold } from '../../states/measures/measure';
import { DeleteMeasure, PublishMeasure, ShowMeasure } from '../../states/measures/measures.action';
import { Select, Store } from '@ngxs/store';
import { MeasuresState } from '../../states/measures/measures.state';
import { Observable } from 'rxjs';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-history-item',
  templateUrl: './history-item.component.html',
  styleUrls: ['./history-item.component.scss']
})
export class HistoryItemComponent implements OnInit {
  @Select(MeasuresState.measures)
  measures$: Observable<(Measure | MeasureSeries)[]>;

  measureType = MeasureType;
  measureSeriesMessageMapping = {
    '=1': _('HISTORY.MEASURE_SERIES.SINGULAR'),
    other: _('HISTORY.MEASURE_SERIES.PLURAL')
  };
  measureBeingSentMap: { [K: string]: boolean } = {};

  constructor(
    protected router: Router,
    private store: Store,
    private alertController: AlertController,
    private translateService: TranslateService
  ) {}

  ngOnInit() {}

  showDetail(measure: Measure) {
    this.store.dispatch(new ShowMeasure(measure));
  }

  DisplaySeries(event: Event) {
    event.stopPropagation();
  }

  publish(event: Event, measure: Measure | MeasureSeries) {
    event.stopPropagation();
    if (this.canSendMeasure(measure)) {
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

  canSendMeasure(measure: Measure | MeasureSeries): boolean {
    return (
      measure.type === MeasureType.MeasureSeries ||
      (measure.accuracy !== undefined &&
        measure.accuracy < PositionAccuracyThreshold.No &&
        measure.endAccuracy !== undefined &&
        measure.endAccuracy < PositionAccuracyThreshold.No)
    );
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
}
