import { Component, Input } from '@angular/core';
import { PositionAccuracy } from '../../states/measures/measure';

@Component({
  selector: 'app-gps-indicator',
  templateUrl: './gps-indicator.component.html',
  styleUrls: ['./gps-indicator.component.scss']
})
export class GpsIndicatorComponent {
  @Input()
  positionAccuracy: PositionAccuracy;

  positionAccuracyEnum = PositionAccuracy;
}
