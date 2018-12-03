import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { AlertOptions } from '@ionic/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(private alertController: AlertController, private platform: Platform) {}

  show(options: AlertOptions, canCloseWithBackButton = true): Promise<any> {
    return this.alertController.create(options).then(alert => {
      alert.present();
      const hardwareCallback = canCloseWithBackButton ? () => alert.dismiss() : () => {};
      // TODO remove forced type once it's fixed https://github.com/ionic-team/ionic/issues/16535
      const backButtonSubscription: unknown = this.platform.backButton.subscribeWithPriority(9999, hardwareCallback);
      alert.onDidDismiss().then(() => (<Subscription>backButtonSubscription).unsubscribe());
      return alert;
    });
  }
}
