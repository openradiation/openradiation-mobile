import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { TabsService } from './tabs.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})
export class Tabs {
  constructor(private menuController: MenuController, private router: Router, private tabsService: TabsService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart && event.url === '/#'))
      .subscribe(() => this.menuController.open());
  }

  tabChange(event: CustomEvent) {
    this.tabsService.currentTab.next(
      event.detail.tab.children[0].children[event.detail.tab.children[0].children.length - 1]
    );
  }
}
