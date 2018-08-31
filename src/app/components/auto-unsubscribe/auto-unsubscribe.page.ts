import { ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { TabsService } from '../../pages/tabs/tabs.service';

export class AutoUnsubscribePage {
  protected subscriptions: Subscription[] = [];
  private focused = false;

  constructor(protected tabsService: TabsService, protected elementRef: ElementRef) {
    this.tabsService.currentTab.subscribe(currentTab => {
      if (this.elementRef.nativeElement === currentTab) {
        if (!this.focused) {
          this.ionViewDidEnter();
        }
      } else {
        if (this.focused) {
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
