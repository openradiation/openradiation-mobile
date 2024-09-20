import { Component } from '@angular/core';
import { MenuController, Platform } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from "@capacitor/core";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  keyboardOpen: boolean;

  constructor(private menuController: MenuController, private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    const isKeyboardAvailable = Capacitor.isPluginAvailable('Keyboard');
    if (isKeyboardAvailable) {
      Keyboard.addListener('keyboardWillShow', () => (this.keyboardOpen = true));
      Keyboard.addListener('keyboardWillHide', () => (this.keyboardOpen = false));
    }
  }

  onMenuOpen() {
    const backButtonSubscription = this.platform.backButton.subscribeWithPriority(9999, () =>
      this.menuController.close().then(() => backButtonSubscription.unsubscribe())
    );
  }
}
