import { Component } from '@angular/core';
import { MenuController, Platform } from '@ionic/angular';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  keyboardOpen: boolean;

  constructor(private menuController: MenuController, private platform: Platform, private fcm: FCM) {
    this.initializeApp();
  }

  initializeApp() {
    window.addEventListener('keyboardWillShow', () => (this.keyboardOpen = true));
    window.addEventListener('keyboardWillHide', () => (this.keyboardOpen = false));
    this.fcm.onNotification().subscribe(notification => console.log(notification));
    this.fcm
      .createNotificationChannel({
        id: 'openradiation', // required
        name: 'OpenRadiation', // required
        description: 'OpenRadiation alert',
        importance: 'high', // https://developer.android.com/guide/topics/ui/notifiers/notifications#importance
        visibility: 'public', // https://developer.android.com/training/notify-user/build-notification#lockscreenNotification
        sound: 'alert_sound', // In the "alert_sound" example, the file should located as resources/raw/alert_sound.mp3
        lights: true, // enable lights for notifications
        vibration: true // enable vibration for notifications
      })
      .then(() => this.fcm.subscribeToTopic('fr'));
  }

  onMenuOpen() {
    const backButtonSubscription = this.platform.backButton.subscribeWithPriority(9999, () =>
      this.menuController.close().then(() => backButtonSubscription.unsubscribe())
    );
  }
}

export interface Form<T> {
  model: T;
  dirty: boolean;
  status: string;
  errors: any;
}
