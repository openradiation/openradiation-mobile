import { Component } from '@angular/core';
import { MenuController, Platform } from '@ionic/angular';

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
    window.addEventListener('keyboardWillShow', () => (this.keyboardOpen = true));
    window.addEventListener('keyboardWillHide', () => (this.keyboardOpen = false));
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
