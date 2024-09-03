import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NavigationService } from '@app/services/navigation.service';
import { DisableAutoPublish, EnableAutoPublish } from '@app/states/measures/measures.action';
import { MeasuresState } from '@app/states/measures/measures.state';

@Component({
  selector: 'app-measures-param',
  templateUrl: './measures-param.page.html',
  styleUrls: ['./measures-param.page.scss']
})
export class MeasuresParamPage {
  autoPublish$: Observable<boolean> = inject(Store).select(MeasuresState.autoPublish);

  constructor(private navigationService: NavigationService, private store: Store) { }

  toggleAutoPublish(enable: boolean) {
    if (enable) {
      this.store.dispatch(new EnableAutoPublish());
    } else {
      this.store.dispatch(new DisableAutoPublish());
    }
  }

  goBack() {
    this.navigationService.goBack();
  }
}
