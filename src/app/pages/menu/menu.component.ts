import { Component } from '@angular/core';
import { AlertController, MenuController } from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { filter, take } from 'rxjs/operators';
import { StartManualMeasure } from '../../states/measures/measures.action';
import { UserState } from '../../states/user/user.state';
import { Observable } from 'rxjs';

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
    private store: Store,
    private actions$: Actions,
    private alertController: AlertController
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => (this.currentUrl = event.url));
    this.actions$
      .pipe(ofActionSuccessful(StartManualMeasure))
      .subscribe(() => this.router.navigate(['measure', 'manual']));
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
        header: 'Saisie manuelle',
        message: `Vous devez vous identifier pour pouvoir saisir manuellemment une mesure`,
        backdropDismiss: false,
        buttons: [
          {
            text: 'Annuler'
          },
          {
            text: `S'identifier`,
            handler: () => {
              this.router.navigate(
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
                { queryParams: { startMeasureAfterLogin: true } }
              );
            }
          }
        ]
      })
      .then(alert => alert.present());
  }
}
