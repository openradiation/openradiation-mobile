import { Injectable } from '@angular/core';
import { NavigationEnd, NavigationExtras, Router, UrlTree } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { filter } from 'rxjs/operators';

// TODO Remove this service when https://github.com/ionic-team/ionic/issues/16340 is fixed
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private stackDepth = 0;

  constructor(private navController: NavController, private platform: Platform, private router: Router) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => this.stackDepth++);
    this.platform.backButton.subscribeWithPriority(9998, () => {
      if (this.stackDepth > 1) {
        this.goBack();
      }
    });
  }

  navigateRoot(url: string | UrlTree | any[]) {
    this.stackDepth = 0;
    this.navController.navigateRoot(url);
  }

  navigateForward(url: string | UrlTree | any[], animated?: boolean, extras?: NavigationExtras) {
    this.navController.navigateForward(url, animated, extras);
  }

  goBack() {
    this.stackDepth -= 2;
    this.navController.goBack();
  }
}
