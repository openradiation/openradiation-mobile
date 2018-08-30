import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Measure } from '../../../states/measures/measure';
import { MeasuresState } from '../../../states/measures/measures.state';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-measure-steps',
  templateUrl: './measure-steps.page.html',
  styleUrls: ['./measure-steps.page.scss']
})
export class MeasureStepsPage {
  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure | undefined>;

  constructor(private router: Router, private socialSharing: SocialSharing) {}

  goToReport() {
    this.router.navigate(['measure', 'report', 'scan']);
  }

  shareSteps(measure: Measure) {
    if (measure.steps) {
      this.socialSharing.shareWithOptions({
        message: `ts;hitsNumber;voltage;temperature\n${measure.steps
          .map(step => Object.values(step).join(';'))
          .join('\n')}`,
        subject: `Mesure ${measure.startTime}`,
        chooserTitle: 'Partager'
      });
    }
  }
}
