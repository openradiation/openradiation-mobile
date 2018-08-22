import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { MeasuresState } from '../../../states/measures/measures.state';
import { Observable } from 'rxjs';
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

  constructor(private store: Store, private router: Router) {
    super();
  }

  ionViewDidEnter() {
    this.store.dispatch(new StartWatchPosition());
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.store.dispatch(new StopWatchPosition());
  }

  endMeasure() {}
}
