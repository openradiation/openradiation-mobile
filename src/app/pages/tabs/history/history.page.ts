import { Component } from '@angular/core';
import { MeasuresState } from '../../../states/measures/measures.state';
import { Observable } from 'rxjs';
import { Measure } from '../../../states/measures/measure';
import { Select, Store } from '@ngxs/store';
import { DeleteMeasure, PublishMeasure } from '../../../states/measures/measures.action';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss']
})
export class HistoryPage {
  @Select(MeasuresState.measures)
  measures$: Observable<Measure[]>;

  constructor(private store: Store) {}

  showDetail(measure: Measure) {}

  delete(measure: Measure) {
    this.store.dispatch(new DeleteMeasure(measure));
  }

  publish(measure: Measure) {
    this.store.dispatch(new PublishMeasure(measure));
  }
}
