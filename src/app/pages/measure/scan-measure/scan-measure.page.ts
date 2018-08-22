import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { MeasuresState } from '../../../states/measures/measures.state';
import { interval, Observable } from 'rxjs';
import { Measure, PositionAccuracy } from '../../../states/measures/measure';
import { AutoUnsubscribePage } from '../../auto-unsubscribe.page';
import { StartWatchPosition, StopWatchPosition } from '../../../states/measures/measures.action';

@Component({
  selector: 'app-scan-measure',
  templateUrl: './scan-measure.page.html',
  styleUrls: ['./scan-measure.page.scss']
})
export class ScanMeasurePage extends AutoUnsubscribePage {
  @Select(MeasuresState.positionAccuracy)
  positionAccuracy$: Observable<PositionAccuracy>;

  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure>;

  currentMeasure: any;

  constructor(private store: Store, private router: Router) {
    super();
    this.currentMeasure = {
      tsStart: Date.now(),
      tsEnd: Date.now(),
      radiation: 0.046
    };
  }

  ionViewDidEnter() {
    interval(1000).subscribe(() => (this.currentMeasure.tsEnd = Date.now()));
    this.store.dispatch(new StartWatchPosition());
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.store.dispatch(new StopWatchPosition());
  }

  endMeasure() {}
}
