import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { SelectIconOption } from '../../../components/select-icon/select-icon-option';
import { Measure, PositionAccuracyThreshold } from '../../../states/measures/measure';
import { MeasuresState } from '../../../states/measures/measures.state';
import { UserState } from '../../../states/user/user.state';

@Component({
  selector: 'app-measure-report-series',
  templateUrl: './measure-report-series.page.html',
  styleUrls: ['./measure-report-series.page.scss']
})
export class MeasureReportSeriesPage extends AutoUnsubscribePage {
  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure | undefined>;

  @Select(MeasuresState.currentSeries)
  currentSeries$: Observable<boolean>;

  @Select(UserState.login)
  login$: Observable<string | undefined>;

  measureReportForm?: FormGroup;

  positionAccuracyThreshold = PositionAccuracyThreshold;

  url = '/measure/report-series';

  constructor(protected router: Router) {
    super(router);
  }

  pageEnter() {
    super.pageEnter();
  }
}
