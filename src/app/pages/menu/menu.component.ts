import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController, MenuController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { StartManualMeasure } from '../../states/measures/measures.action';
import { UserState } from '../../states/user/user.state';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Select(UserState.login)
  login$: Observable<string | undefined>;

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
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => (this.currentUrl = event.url));
    this.actions$
      .pipe(ofActionSuccessful(StartManualMeasure))
      .subscribe(() => this.navController.navigateRoot(['measure', 'report'], true));
  }

  closeMenu() {
    this.menuController.close();
  }

  startManualMeasure() {
    this.closeMenu();
    this.login$.pipe(take(1)).subscribe(login => {
      if (login !== undefined) {
        this.store.dispatch(new StartManualMeasure());
      } else {
        this.goToLogin();
      }
    });
  }

  private goToLogin() {
    this.alertController
      .create({
        header: this.translateService.instant('MEASURE_MANUAL.TITLE'),
        message: this.translateService.instant('MEASURE_MANUAL.ALERT'),
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
                { queryParams: { startMeasureAfterLogin: true } }
              )
          }
        ]
      })
      .then(alert => alert.present());
  }
}
