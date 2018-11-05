import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})
export class Tabs {
  constructor(private menuController: MenuController) {}

  openMenu() {
    this.menuController.open();
  }
}
