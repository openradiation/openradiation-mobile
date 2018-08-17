import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DisableAutoPublish, EnableAutoPublish } from '../../../../states/measures/measures.action';
import { MeasuresState } from '../../../../states/measures/measures.state';

@Component({
  selector: 'app-measures-param',
  templateUrl: './measures-param.page.html',
  styleUrls: ['./measures-param.page.scss']
})
export class MeasuresParamPage {
  @Select(MeasuresState.autoPublish)
  autoPublish$: Observable<boolean>;

  constructor(private router: Router, private store: Store) {}

  toggleAutoPublish(enable: boolean) {
    if (enable) {
      this.store.dispatch(new EnableAutoPublish());
    } else {
      this.store.dispatch(new DisableAutoPublish());
    }
  }

  goToSettings() {
    this.router.navigate([
      'tabs',
      {
        outlets: {
          settings: 'settings'
        }
      }
    ]);
  }
}
