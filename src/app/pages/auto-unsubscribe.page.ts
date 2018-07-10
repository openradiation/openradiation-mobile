import { Subscription } from 'rxjs/index';

export class AutoUnsubscribePage {
  protected subscriptions: Subscription[] = [];

  ionViewWillLeave() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }
}
