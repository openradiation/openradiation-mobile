import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PushNotifications, PushNotificationSchema } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { AlertService } from './alert.service';
import { initializeApp } from "firebase/app";
import { Capacitor } from "@capacitor/core";
import { environment } from "@environments/environment";


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private isPushNotificationsAvailable = false
  constructor(
    private alertService: AlertService,
    private translateService: TranslateService
  ) { }

  async init() {
    this.isPushNotificationsAvailable = Capacitor.isPluginAvailable('PushNotifications') && environment.firebase.pushNotificationsConfigured;
    if (this.isPushNotificationsAvailable) {
      await initializeApp(environment.firebase);

      PushNotifications.createChannel({
        id: 'openradiation',
        name: 'OpenRadiation',
        description: 'OpenRadiation alert',
        importance: 4,  // Importance high : see https://developer.android.com/reference/android/app/NotificationManager#IMPORTANCE_HIGH
        visibility: 1, // Visibility Public : see https://developer.android.com/reference/androidx/core/app/NotificationCompat#VISIBILITY_PUBLIC()
        sound: 'alert_sound', // File should located as resources/raw/alert_sound.mp3
        lights: true, // enable lights for notifications
        vibration: true // enable vibration for notifications
      });
      await PushNotifications.addListener('pushNotificationReceived', notification => { this.showNotificationAlert(notification) });

      // Show in-app alerts for already pushed notifications
      // (this was done through getInitialPushPayload() in old cordova fcm plugin implementation)
      const notificationList = await PushNotifications.getDeliveredNotifications();
      notificationList.notifications.forEach(notification => {
        if (notification) {
          setTimeout(() => this.showNotificationAlert(notification));
        }
      });
      // May not work if no permission was granted.
      await PushNotifications.register();
    }
  }

  async useLanguage(newLanguage: string, previousLanguage?: string): Promise<void> {
    if (!previousLanguage) {
      await FCM.subscribeTo({ topic: newLanguage });
    } else if (previousLanguage !== newLanguage) {
      await FCM.unsubscribeFrom({ topic: previousLanguage });
      await FCM.subscribeTo({ topic: newLanguage });
    }
  }

  async enableNotifications(language?: string): Promise<boolean> {
    if (this.isPushNotificationsAvailable) {
      if (language) {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }
        if (permStatus.receive === 'granted') {
          await PushNotifications.register();
          await FCM.subscribeTo({ topic: language });
          return true;
        }
      }
    }
    return false;
  }

  async disableNotifications(language?: string): Promise<void> {
    if (language) {
      await FCM.unsubscribeFrom({ topic: language });
    }
  }

  private showNotificationAlert({ title, body }: PushNotificationSchema) {
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
