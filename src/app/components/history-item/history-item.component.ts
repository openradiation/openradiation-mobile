import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { Measure, MeasureSeries, MeasureType } from '../../states/measures/measure';

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

  @Output()
  publishEvent: EventEmitter<Measure | MeasureSeries> = new EventEmitter();
  @Output()
  deleteEvent = new EventEmitter();

  displaySeries: Measure[];
  deploy = false;
  measureType = MeasureType;
  measureSeriesMessageMapping = {
    '=1': _('HISTORY.MEASURE_SERIES.SINGULAR'),
    other: _('HISTORY.MEASURE_SERIES.PLURAL')
  };

  constructor() {}

  ngOnInit() {}

  DeploySeries(event: Event, measure: MeasureSeries) {
    event.stopPropagation();
    this.deploy = !this.deploy;
    this.displaySeries = measure.measures;
  }

  publish(event: Event) {
    event.stopPropagation();
    this.publishEvent.emit(this.measure);
  }

  delete(event: Event) {
    event.stopPropagation();
    this.deleteEvent.emit(this.measure);
  }
}
