import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NavigationService } from '@app/services/navigation.service';
import { Measure } from '@app/states/measures/measure';
import { MeasuresState } from '@app/states/measures/measures.state';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-measure-steps',
  templateUrl: './measure-steps.page.html',
  styleUrls: ['./measure-steps.page.scss']
})
export class MeasureStepsPage {
  currentMeasure$: Observable<Measure | undefined> = inject(Store).select(MeasuresState.currentMeasure);

  constructor(
    private navigationService: NavigationService,
    private translateService: TranslateService
  ) { }

  goBack() {
    this.navigationService.goBack();
  }

  shareSteps(measure: Measure) {
    if (measure.steps) {
      Share.share({
        text: `ts;hitsNumber;voltage;temperature\n${measure.steps
          .map(step => Object.values(step).join(';'))
          .join('\n')}`,
        title: `${this.translateService.instant('MEASURES.MEASURE')} ${measure.startTime}`,
        dialogTitle: this.translateService.instant('GENERAL.SHARE')
      });
    }
  }
}
