import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AlertService } from '@app/services/alert.service';
import { NavigationService } from '@app/services/navigation.service';
import { AbstractDevice } from '@app/states/devices/abstract-device';
import { DevicesState } from '@app/states/devices/devices.state';
import { StartManualMeasure, StartMeasureSeriesParams } from '@app/states/measures/measures.action';
import { UserState } from '@app/states/user/user.state';
import { RedirectAfterLogin } from '../tabs/settings/log-in/log-in.page';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  login$: Observable<string | undefined> = inject(Store).select(UserState.login);

  connectedDevice$: Observable<AbstractDevice | undefined> = inject(Store).select(DevicesState.connectedDevice);

  currentUrl: string;

  constructor(
    private menuController: MenuController,
    private router: Router,
    private navigationService: NavigationService,
    private store: Store,
    private actions$: Actions,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
    });
    this.actions$
      .pipe(ofActionSuccessful(StartManualMeasure))
      .subscribe(() => this.navigationService.navigateRoot(['measure', 'report']));
    this.actions$
      .pipe(ofActionSuccessful(StartMeasureSeriesParams))
      .subscribe(() => this.navigationService.navigateRoot(['measure', 'series']));
  }

  closeMenu() {
    this.menuController.close();
  }

  goToAbout() {
    this.closeMenu();
    this.navigationService.navigateForward(['tabs', 'other', 'about']);
  }

  goToFeedback() {
    this.closeMenu();
    this.navigationService.navigateForward(['tabs', 'feedback']);
  }

  goToLegalNotice() {
    this.closeMenu();
    this.navigationService.navigateForward(['tabs', 'other', 'legal-notice']);
  }

  startMeasureSeries() {
    this.closeMenu();
    this.connectedDevice$.pipe(take(1)).subscribe(connectedDevice => {
      if (connectedDevice) {
        this.login$.pipe(take(1)).subscribe(login => {
          if (login !== undefined) {
            this.store.dispatch(new StartMeasureSeriesParams());
          } else {
            this.goToLogin(RedirectAfterLogin.MeasureSeries);
          }
        });
      } else {
        this.goToDevices();
      }
    });
  }

  startManualMeasure() {
    this.closeMenu();
    this.login$.pipe(take(1)).subscribe(login => {
      if (login !== undefined) {
        this.store.dispatch(new StartManualMeasure()).subscribe();
      } else {
        this.goToLogin(RedirectAfterLogin.ManualMeasure);
      }
    });
  }

  private goToLogin(redirectAfterLogin: RedirectAfterLogin) {
    this.alertService.show({
      header:
        redirectAfterLogin === RedirectAfterLogin.ManualMeasure
          ? this.translateService.instant('MEASURE_MANUAL.TITLE')
          : this.translateService.instant('MEASURE_SERIES.TITLE'),
      message:
        redirectAfterLogin === RedirectAfterLogin.ManualMeasure
          ? this.translateService.instant('MEASURE_MANUAL.ALERT')
          : this.translateService.instant('MEASURE_SERIES.ALERT_LOG_IN'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translateService.instant('GENERAL.CANCEL')
        },
        {
          text: this.translateService.instant('LOG_IN.TITLE'),
          handler: () =>
            this.navigationService.navigateForward(['tabs', 'settings', 'log-in'], {
              animated: true,
              queryParams: { redirectAfterLogin: redirectAfterLogin }
            })
        }
      ]
    });
  }

  private goToDevices() {
    this.alertService.show({
      header: this.translateService.instant('MEASURE_SERIES.TITLE'),
      message: this.translateService.instant('MEASURE_SERIES.ALERT_SENSOR'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translateService.instant('GENERAL.CANCEL')
        },
        {
          text: this.translateService.instant('SENSORS.ALERT_TITLE'),
          handler: () => this.navigationService.navigateForward(['tabs', 'settings', 'devices'], { animated: true })
        }
      ]
    });
  }
}
