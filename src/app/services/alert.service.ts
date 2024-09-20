import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { AlertOptions } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(private alertController: AlertController, private platform: Platform) { }

  show(options: AlertOptions, canCloseWithBackButton = true): Promise<HTMLIonAlertElement> {
    return this.alertController.create(options).then(alert => {
      alert.present();
      const hardwareCallback = canCloseWithBackButton ? () => alert.dismiss() : () => {
        // Nothing to do
      };
      const backButtonSubscription = this.platform.backButton.subscribeWithPriority(9999, hardwareCallback);
      alert.onDidDismiss().then(() => backButtonSubscription.unsubscribe());
      return alert;
    });
  }
}
