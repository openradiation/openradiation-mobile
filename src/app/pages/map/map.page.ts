import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})
export class MapPage {
  iframeURL: SafeResourceUrl;

  constructor(
    private domSanitizer: DomSanitizer,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic,
    private platform: Platform
  ) {
    if (this.platform.is('cordova')) {
      this.diagnostic.isLocationAvailable().then(locationAvailable => {
        if (locationAvailable) {
          this.geolocation.getCurrentPosition().then(geoposition => {
            const zoom = 12;
            const lat = geoposition.coords.latitude.toFixed(7);
            const long = geoposition.coords.longitude.toFixed(7);
            this.iframeURL = domSanitizer.bypassSecurityTrustResourceUrl(
              `${environment.INAPPBROWSER_URI}/${zoom}/${lat}/${long}`
            );
          });
        } else {
          this.iframeURL = domSanitizer.bypassSecurityTrustResourceUrl(environment.INAPPBROWSER_URI);
        }
      });
    } else {
      this.iframeURL = domSanitizer.bypassSecurityTrustResourceUrl(environment.INAPPBROWSER_URI);
    }
  }
}
