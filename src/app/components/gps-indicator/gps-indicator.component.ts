import { Component, Input, OnChanges } from '@angular/core';
import { PositionAccuracy, PositionAccuracyThreshold } from '@app/states/measures/measure';

@Component({
  selector: 'app-gps-indicator',
  templateUrl: './gps-indicator.component.html',
  styleUrls: ['./gps-indicator.component.scss']
})
export class GpsIndicatorComponent implements OnChanges {
  @Input()
  accuracy: number;

  @Input()
  compact = false;

  positionAccuracy: PositionAccuracy;
  positionAccuracyEnum = PositionAccuracy;

  ngOnChanges() {
    if (!this.accuracy || this.accuracy === PositionAccuracyThreshold.No) {
      this.positionAccuracy = PositionAccuracy.No;
    } else if (this.accuracy >= PositionAccuracyThreshold.Inaccurate) {
      this.positionAccuracy = PositionAccuracy.Inaccurate;
    } else if (this.accuracy >= PositionAccuracyThreshold.Poor) {
      this.positionAccuracy = PositionAccuracy.Poor;
    } else {
      this.positionAccuracy = PositionAccuracy.Good;
    }
  }
}
