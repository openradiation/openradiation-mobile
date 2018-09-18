import { OnDestroy } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

export abstract class AutoUnsubscribePage implements OnDestroy {
  protected subscriptions: Subscription[] = [];
  private focused = false;
  private routerSubscribe: Subscription;

  protected abstract url: string;

  protected constructor(protected router: Router) {
    this.routerSubscribe = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd || event instanceof NavigationStart))
      .subscribe(event => {
        if (
          event instanceof NavigationEnd &&
          (event.url.split('?')[0] === this.url || event.url === '/') &&
          !this.focused
        ) {
          this.pageEnter();
        }
        if (
          event instanceof NavigationStart &&
          event.url.split('?')[0] !== this.url &&
          this.focused &&
          event.url !== '/#'
        ) {
          this.pageLeave();
        }
      });
  }

  ngOnDestroy() {
    this.routerSubscribe.unsubscribe();
  }

  pageEnter() {
    this.focused = true;
  }

  pageLeave() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
    this.focused = false;
  }
}
