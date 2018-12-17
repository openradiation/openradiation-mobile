import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { TabsGuard } from './tabs.guard';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})
export class Tabs {
  constructor(private menuController: MenuController, private tabsGuard: TabsGuard) {}

  openMenu() {
    this.tabsGuard.blockNavigation();
    this.menuController.open();
  }
}
