import { Injectable } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { INotificationPayload } from 'cordova-plugin-fcm-with-dependecy-updated/src/www/INotificationPayload';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private platform: Platform,
    private fcm: FCM,
    private alertService: AlertService,
    private translateService: TranslateService,
    private diagnostic: Diagnostic
  ) {}

  init() {
    this.fcm.createNotificationChannel({
      id: 'openradiation', // required
      name: 'OpenRadiation', // required
      description: 'OpenRadiation alert',
      importance: 'high', // https://developer.android.com/guide/topics/ui/notifiers/notifications#importance
      visibility: 'public', // https://developer.android.com/training/notify-user/build-notification#lockscreenNotification
      sound: 'alert_sound', // In the "alert_sound" example, the file should located as resources/raw/alert_sound.mp3
      lights: true, // enable lights for notifications
      vibration: true // enable vibration for notifications
    });
    this.fcm.onNotification().subscribe(notification => this.showNotificationAlert(notification));
    this.fcm.getInitialPushPayload().then(notification => {
      if (notification) {
        setTimeout(() => this.showNotificationAlert(notification));
      }
    });
  }

  useLanguage(newLanguage: string, previousLanguage?: string): Promise<void> {
    if (!previousLanguage) {
      return this.fcm.subscribeToTopic(newLanguage);
    } else if (previousLanguage !== newLanguage) {
      return this.fcm.unsubscribeFromTopic(previousLanguage).then(() => this.fcm.subscribeToTopic(newLanguage));
    } else {
      return Promise.resolve();
    }
  }

  enableNotifications(language?: string): Promise<boolean> {
    if (language) {
      return this.fcm
        .hasPermission()
        .then(hasPermission => hasPermission || this.fcm.requestPushPermission())
        .then(hasPermission => {
          if (hasPermission) {
            return this.fcm.subscribeToTopic(language).then(() => true);
          } else {
            this.alertService.show({
              header: this.translateService.instant('NOTIFICATIONS.ALERT.TITLE'),
              message: this.translateService.instant('NOTIFICATIONS.ALERT.MESSAGE'),
              backdropDismiss: true,
              buttons: [
                {
                  text: this.translateService.instant('GENERAL.CANCEL')
                },
                {
                  text: this.translateService.instant('GENERAL.GO_TO_SETTINGS'),
                  handler: () => this.diagnostic.switchToSettings()
                }
              ]
            });
            return false;
          }
        });
    } else {
      return Promise.resolve(false);
    }
  }

  disableNotifications(language?: string): Promise<void> {
    if (language) {
      return this.fcm.unsubscribeFromTopic(language);
    } else {
      return Promise.resolve();
    }
  }

  private showNotificationAlert({ title, body }: INotificationPayload) {
    this.alertService.show(
      {
        header: title,
        message: body,
        backdropDismiss: true,
        buttons: [
          {
            text: this.translateService.instant('GENERAL.OK')
          }
        ]
      },
      true
    );
  }
}
