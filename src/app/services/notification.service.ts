import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private platform: Platform,
    private fcm: FCM,
    private alertService: AlertService,
    private translateService: TranslateService
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
    this.fcm.onNotification().subscribe(({ title, body }) =>
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
      )
    );
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
        .then(hasPermission => (!hasPermission ? false : this.fcm.subscribeToTopic(language).then(() => true)));
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
}
