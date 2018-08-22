import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { MeasuresState } from '../../../states/measures/measures.state';
import { Observable } from 'rxjs';
import { HitsAccuracy, HitsAccuracyThreshold, Measure, PositionAccuracy } from '../../../states/measures/measure';
import { AutoUnsubscribePage } from '../../auto-unsubscribe.page';
import { StartWatchPosition, StopWatchPosition } from '../../../states/measures/measures.action';
import { DevicesState } from '../../../states/devices/devices.state';
import { AbstractDevice } from '../../../states/devices/abstract-device';

@Component({
  selector: 'app-scan-measure',
  templateUrl: './scan-measure.page.html',
  styleUrls: ['./scan-measure.page.scss']
})
export class ScanMeasurePage extends AutoUnsubscribePage {
  @Select(MeasuresState.positionAccuracy)
  positionAccuracy$: Observable<PositionAccuracy>;

  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure | undefined>;

  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice>;

  hitsAccuracy: HitsAccuracy = HitsAccuracy.start;
  hitsAccuracyThreshold = HitsAccuracyThreshold;
  hitsAccuracyWidth = 0;

  constructor(private store: Store, private router: Router) {
    super();
  }

  ionViewDidEnter() {
    this.subscriptions.push(this.currentMeasure$.subscribe(measure => this.updateHitsAccuracy(measure)));
    this.store.dispatch(new StartWatchPosition());
  }

  ionViewWillLeave() {
    super.ionViewWillLeave();
    this.store.dispatch(new StopWatchPosition());
  }

  updateHitsAccuracy(measure?: Measure) {
    if (measure) {
      if (measure.hits >= HitsAccuracyThreshold.accurate) {
        this.hitsAccuracy = HitsAccuracy.accurate;
      } else if (measure.hits >= HitsAccuracyThreshold.good) {
        this.hitsAccuracy = HitsAccuracy.good;
      } else if (measure.hits >= HitsAccuracyThreshold.medium) {
        this.hitsAccuracy = HitsAccuracy.medium;
      } else if (measure.hits >= HitsAccuracyThreshold.bad) {
        this.hitsAccuracy = HitsAccuracy.bad;
      } else {
        this.hitsAccuracy = HitsAccuracy.start;
      }
      this.hitsAccuracyWidth = Math.min((measure.hits / HitsAccuracyThreshold.accurate) * 100, 100);
    }
  }

  endMeasure() {}
}
