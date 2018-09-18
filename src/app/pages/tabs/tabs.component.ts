import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})
export class Tabs {
  constructor(private menuController: MenuController, private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart && event.url === '/#'))
      .subscribe(() => this.menuController.open());
  }
}
