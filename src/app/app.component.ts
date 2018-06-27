import { Component } from '@angular/core';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(private platform: Platform, private splashScreen: SplashScreen, private statusBar: StatusBar) {
    this.initializeApp();
  }

  initializeApp() {
    // TODO use platform.ready() again when it's fixed https://github.com/ionic-team/ionic/issues/14647
    /*this.platform.ready().then(() => {
      this.statusBar.overlaysWebView(true);
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });*/
    document.addEventListener('deviceready', () => {
      this.statusBar.overlaysWebView(true);
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
