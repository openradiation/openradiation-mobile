import { Component } from '@angular/core';
import { MenuController, Platform } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from "@capacitor/core";
import { environment } from '@environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  keyboardOpen: boolean;
  envIsProduction = false;
  envName = ""

  constructor(private menuController: MenuController, private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    const isKeyboardAvailable = Capacitor.isPluginAvailable('Keyboard');
    if (isKeyboardAvailable) {
      Keyboard.addListener('keyboardWillShow', () => (this.keyboardOpen = true));
      Keyboard.addListener('keyboardWillHide', () => (this.keyboardOpen = false));
    }
    const splitted = environment.APP_NAME_VERSION.split(" ")
    if (splitted.length >= 2) {
      this.envName = splitted[splitted.length - 1] + " " + splitted[splitted.length - 2]
      this.envIsProduction = environment.production && this.envName.toLocaleLowerCase().indexOf('beta') == -1
    }
  }

  onMenuOpen() {
    const backButtonSubscription = this.platform.backButton.subscribeWithPriority(9999, () =>
      this.menuController.close().then(() => backButtonSubscription.unsubscribe())
    );
  }
}
