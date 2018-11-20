import { Component } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NavigationService } from '../../../services/navigation.service';
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

  constructor(
    private navigationService: NavigationService,
    private socialSharing: SocialSharing,
    private translateService: TranslateService
  ) {}

  goBack() {
    this.navigationService.goBack();
  }

  shareSteps(measure: Measure) {
    if (measure.steps) {
      this.socialSharing.shareWithOptions({
        message: `ts;hitsNumber;voltage;temperature\n${measure.steps
          .map(step => Object.values(step).join(';'))
          .join('\n')}`,
        subject: `${this.translateService.instant('MEASURES.MEASURE')} ${measure.startTime}`,
        chooserTitle: this.translateService.instant('GENERAL.SHARE')
      });
    }
  }
}
