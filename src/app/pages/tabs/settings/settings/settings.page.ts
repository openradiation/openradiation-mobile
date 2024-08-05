import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NavigationService } from '@app/services/navigation.service';
import { DisableExpertMode, EnableExpertMode } from '@app/states/measures/measures.action';
import { MeasuresState } from '@app/states/measures/measures.state';
import { DisableNotifications, EnableNotifications, LogOut, SetLanguage } from '@app/states/user/user.action';
import { UserState } from '@app/states/user/user.state';

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

  @Select(UserState.language)
  language$: Observable<string | undefined>;

  @Select(UserState.notifications)
  notifications$: Observable<boolean | undefined>;

  constructor(private navigationService: NavigationService, private store: Store) { }

  toggleExpertMode(enable: boolean) {
    if (enable) {
      this.store.dispatch(new EnableExpertMode());
    } else {
      this.store.dispatch(new DisableExpertMode());
    }
  }

  toggleNotifications(enable: boolean) {
    if (enable) {
      this.store.dispatch(new EnableNotifications());
    } else {
      this.store.dispatch(new DisableNotifications());
    }
  }

  goToDevices() {
    this.navigationService.navigateForward(['tabs', 'settings', 'devices']);
  }

  goToMeasuresParam() {
    this.navigationService.navigateForward(['tabs', 'settings', 'measures-param']);
  }

  goToPlaneMode() {
    this.navigationService.navigateForward(['tabs', 'settings', 'plane-mode']);
  }

  goToLogIn() {
    this.navigationService.navigateForward(['tabs', 'settings', 'log-in']);
  }

  logOut() {
    this.store.dispatch(new LogOut());
  }

  setLanguage(language: string) {
    this.store.dispatch(new SetLanguage(language));
  }
}
