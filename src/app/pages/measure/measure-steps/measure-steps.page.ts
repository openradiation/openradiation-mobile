import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { MeasuresState } from '../../../states/measures/measures.state';
import { Observable } from 'rxjs';
import { Measure } from '../../../states/measures/measure';
import { Router } from '@angular/router';

@Component({
  selector: 'app-measure-steps',
  templateUrl: './measure-steps.page.html',
  styleUrls: ['./measure-steps.page.scss']
})
export class MeasureStepsPage {
  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure | undefined>;

  constructor(private router: Router) {}

  goToReport() {
    this.router.navigate(['measure', 'report', 'scan']);
  }
}
