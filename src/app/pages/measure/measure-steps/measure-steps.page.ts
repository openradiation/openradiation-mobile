import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Measure } from '../../../states/measures/measure';
import { MeasuresState } from '../../../states/measures/measures.state';

@Component({
  selector: 'app-measure-steps',
  templateUrl: './measure-steps.page.html',
  styleUrls: ['./measure-steps.page.scss']
})
export class MeasureStepsPage {
  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure | undefined>;

  currentMeasure: Partial<Measure> = {
    startTime: Date.now(),
    steps: []
  };

  constructor(private router: Router) {
    for (let i = 0; i < 100; i++) {
      this.currentMeasure.steps!.push({
        ts: Date.now(),
        voltage: Math.random() * 100 + 200,
        temperature: Math.random() * 10 + 20,
        hitsNumber: Math.round(Math.random() * 10)
      });
    }
  }

  goToReport() {
    this.router.navigate(['measure', 'report', 'scan']);
  }
}
