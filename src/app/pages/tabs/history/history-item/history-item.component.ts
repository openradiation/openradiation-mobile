import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Measure, MeasureSeries, MeasureType } from '../../../../states/measures/measure';

@Component({
  selector: 'app-history-item',
  templateUrl: './history-item.component.html',
  styleUrls: ['./history-item.component.scss']
})
export class HistoryItemComponent implements OnInit {
  @Input()
  measure: Measure | MeasureSeries;
  @Input()
  canPublish: boolean;
  @Input()
  measureBeingSent: boolean | undefined;
  @Input()
  showArrowDetail: boolean;

  @Output()
  showDetail = new EventEmitter();
  @Output()
  publish = new EventEmitter();
  @Output()
  delete = new EventEmitter();

  showSeriesDetail = false;
  measureType = MeasureType;
  measureSeriesMessageMapping = {
    '=1': <string>_('HISTORY.MEASURE_SERIES.SINGULAR'),
    other: <string>_('HISTORY.MEASURE_SERIES.PLURAL')
  };

  constructor() { }

  ngOnInit() { }

  showDetailClick() {
    this.showDetail.emit();
  }

  toggleSeriesDetail(event: Event) {
    event.stopPropagation();
    this.showSeriesDetail = !this.showSeriesDetail;
  }

  publishClick(event: Event) {
    event.stopPropagation();
    this.publish.emit();
  }

  deleteClick(event: Event) {
    event.stopPropagation();
    this.delete.emit();
  }
}
