import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DisableExpertMode, EnableExpertMode } from '../../../../states/measures/measures.action';
import { MeasuresState } from '../../../../states/measures/measures.state';
import { LogOut } from '../../../../states/user/user.action';
import { UserState } from '../../../../states/user/user.state';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  @Select(MeasuresState.expertMode)
  expertMode$: Observable<boolean>;

  @Select(UserState.login)
  login$: Observable<string | undefined>;

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

  goToLogIn() {
    this.router.navigate([
      'tabs',
      {
        outlets: {
          settings: 'log-in'
        }
      }
    ]);
  }

  logOut() {
    this.store.dispatch(new LogOut());
  }
}
