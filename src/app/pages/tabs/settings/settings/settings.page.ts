import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DisableExpertMode, EnableExpertMode } from '../../../../states/measures/measures.action';
import { MeasuresState } from '../../../../states/measures/measures.state';
import { LogOut } from '../../../../states/user/user.action';
import { UserState } from '../../../../states/user/user.state';
import { NavController } from '@ionic/angular';

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

  constructor(private navController: NavController, private store: Store) {}

  toggleExpertMode(enable: boolean) {
    if (enable) {
      this.store.dispatch(new EnableExpertMode());
    } else {
      this.store.dispatch(new DisableExpertMode());
    }
  }

  goToDevices() {
    this.navController.navigateForward([
      'tabs',
      {
        outlets: {
          settings: 'devices'
        }
      }
    ]);
  }

  goToMeasuresParam() {
    this.navController.navigateForward([
      'tabs',
      {
        outlets: {
          settings: 'measures-param'
        }
      }
    ]);
  }

  goToLogIn() {
    this.navController.navigateForward([
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
