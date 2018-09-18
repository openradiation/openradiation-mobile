import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';

export abstract class AutoUnsubscribePage implements OnDestroy {
  protected subscriptions: Subscription[] = [];
  private focused = false;
  private routerSubscribe: Subscription;

  protected abstract url: string;

  protected constructor(protected router: Router) {
    this.routerSubscribe = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd || event instanceof NavigationStart))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          if (event.url === this.url && !this.focused && event.url !== '/#') {
            this.ionViewDidEnter();
          }
        }
        if (event instanceof NavigationStart) {
          if (event.url !== this.url && this.focused && event.url !== '/#') {
            this.ionViewWillLeave();
          }
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscribe.unsubscribe();
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
