import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { Measure } from '../../../states/measures/measure';
import { MeasuresState } from '../../../states/measures/measures.state';
import { UserState } from '../../../states/user/user.state';

@Component({
  selector: 'app-measure-series',
  templateUrl: './measure-series.page.html',
  styleUrls: ['./measure-series.page.scss']
})
export class MeasureSeriesPage extends AutoUnsubscribePage {
  @Select(MeasuresState.currentMeasure)
  currentMeasure$: Observable<Measure | undefined>;

  @Select(MeasuresState.expertMode)
  expertMode$: Observable<boolean>;

  @Select(UserState.login)
  login$: Observable<string | undefined>;

  url = '/measure/series';

  constructor(protected router: Router) {
    super(router);
  }

  pageEnter() {
    super.pageEnter();
  }
}
