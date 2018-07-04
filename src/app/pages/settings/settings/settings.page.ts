import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { MeasuresState } from '../../../states/measures/measures.state';
import { Observable } from 'rxjs/internal/Observable';
import { DisableExpertMode, EnableExpertMode } from '../../../states/measures/measures.action';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  @Select(MeasuresState.expertMode) expertMode$: Observable<boolean>;

  constructor(private router: Router, private store: Store) {}

  toggleExpertMode(enable: boolean) {
    if (enable) {
      this.store.dispatch(new EnableExpertMode());
    } else {
      this.store.dispatch(new DisableExpertMode());
    }
  }

  goToDevices() {
    this.router.navigate([
      'tabs',
      {
        outlets: {
          settings: 'devices'
        }
      }
    ]);
  }

  goToMeasuresParam() {
    this.router.navigate([
      'tabs',
      {
        outlets: {
          settings: 'measures-param'
        }
      }
    ]);
  }
}
