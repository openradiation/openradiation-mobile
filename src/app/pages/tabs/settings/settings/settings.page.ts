import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NavigationService } from '@app/services/navigation.service';
import { DisableExpertMode, EnableExpertMode } from '@app/states/measures/measures.action';
import { MeasuresState } from '@app/states/measures/measures.state';
import { LogOut, SetLanguage } from '@app/states/user/user.action';
import { UserState } from '@app/states/user/user.state';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  expertMode$: Observable<boolean> = inject(Store).select(MeasuresState.expertMode);

  login$: Observable<string | undefined> = inject(Store).select(UserState.login);

  language$: Observable<string | undefined> = inject(Store).select(UserState.language);

  notifications$: Observable<boolean | undefined> = inject(Store).select(UserState.notifications);

  constructor(private navigationService: NavigationService, private store: Store) { }

  toggleExpertMode(enable: boolean) {
    if (enable) {
      this.store.dispatch(new EnableExpertMode());
    } else {
      this.store.dispatch(new DisableExpertMode());
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
