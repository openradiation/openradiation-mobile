import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController, MenuController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AbstractDevice } from '../../states/devices/abstract-device';
import { DevicesState } from '../../states/devices/devices.state';
import { StartManualMeasure, StartMeasureSeriesParams } from '../../states/measures/measures.action';
import { UserState } from '../../states/user/user.state';
import { RedirectAfterLogin } from '../tabs/settings/log-in/log-in.page';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Select(UserState.login)
  login$: Observable<string | undefined>;

  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice | undefined>;

  canStartMeasure: Observable<boolean>;
  currentUrl: string;

  constructor(
    private menuController: MenuController,
    private router: Router,
    private navController: NavController,
    private store: Store,
    private actions$: Actions,
    private alertController: AlertController,
    private translateService: TranslateService
  ) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
      this.menuController.enable(this.currentUrl === '/' || this.currentUrl.includes('/tabs/('));
    });
    this.actions$
      .pipe(ofActionSuccessful(StartManualMeasure))
      .subscribe(() => this.navController.navigateRoot(['measure', 'report'], true));
    this.actions$
      .pipe(ofActionSuccessful(StartMeasureSeriesParams))
      .subscribe(() => this.navController.navigateRoot(['measure', 'series'], true));
    this.canStartMeasure = this.connectedDevice$.pipe(map(connectedDevice => connectedDevice !== undefined));
  }

  closeMenu() {
    this.menuController.close();
  }

  startMeasureSeries() {
    this.closeMenu();
    this.login$.pipe(take(1)).subscribe(login => {
      if (login !== undefined) {
        this.connectedDevice$.pipe(take(1)).subscribe(connectedDevice => {
          if (connectedDevice) {
            this.store.dispatch(new StartMeasureSeriesParams());
          }
        });
      } else {
        this.goToLogin(RedirectAfterLogin.MeasureSeries);
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
    this.alertController
      .create({
        header:
          redirectAfterLogin === RedirectAfterLogin.ManualMeasure
            ? this.translateService.instant('MEASURE_MANUAL.TITLE')
            : this.translateService.instant('MEASURE_SERIES.TITLE'),
        message:
          redirectAfterLogin === RedirectAfterLogin.ManualMeasure
            ? this.translateService.instant('MEASURE_MANUAL.ALERT')
            : this.translateService.instant('MEASURE_SERIES.ALERT'),
        backdropDismiss: false,
        buttons: [
          {
            text: this.translateService.instant('GENERAL.CANCEL')
          },
          {
            text: this.translateService.instant('LOG_IN.TITLE'),
            handler: () =>
              this.navController.navigateForward(
                [
                  'tabs',
                  {
                    outlets: {
                      settings: 'log-in',
                      home: null,
                      history: null,
                      map: null,
                      other: null
                    }
                  }
                ],
                true,
                { queryParams: { redirectAfterLogin: redirectAfterLogin } }
              )
          }
        ]
      })
      .then(alert => alert.present());
  }
}
