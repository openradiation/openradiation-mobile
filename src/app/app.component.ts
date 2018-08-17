import { Component } from '@angular/core';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { MenuController, Platform } from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  keyboardOpen: boolean;
  currentUrl: string;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private menuController: MenuController,
    private router: Router
  ) {
    this.initializeApp();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
      console.log(this.currentUrl);
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.overlaysWebView(true);
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
    });
    // TODO remove when autoscroll to input is fixed https://github.com/ionic-team/ionic/issues/13821 https://github.com/ionic-team/ionic/issues/10629#issuecomment-395084125
    window.addEventListener('keyboardDidShow', () => {
      document.activeElement.scrollIntoView();
    });
    window.addEventListener('keyboardWillShow', () => (this.keyboardOpen = true));
    window.addEventListener('keyboardWillHide', () => (this.keyboardOpen = false));
  }

  closeMenu() {
    this.menuController.close();
  }
}
