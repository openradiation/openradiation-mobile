import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-page-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  constructor(private menuController: MenuController, private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart && event.url === '/#'))
      .subscribe(() => this.menuController.open());
  }
}
