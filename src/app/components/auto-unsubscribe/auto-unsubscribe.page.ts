import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

export abstract class AutoUnsubscribePage {
  protected subscriptions: Subscription[] = [];
  private focused = false;

  protected abstract url: string;

  protected constructor(protected router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd || event instanceof NavigationStart))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          if (event.url === this.url && !this.focused) {
            this.ionViewDidEnter();
          }
        }
        if (event instanceof NavigationStart) {
          if (event.url !== this.url && this.focused) {
            this.ionViewWillLeave();
          }
        }
      });
  }

  ionViewDidEnter() {
    this.focused = true;
  }

  ionViewWillLeave() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
    this.focused = false;
  }
}
