import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})
export class MapPage {
  iframeURL: SafeResourceUrl;
  isLoading = true;
  private iframeLoads = 0;

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

  mapLoaded() {
    if (this.iframeLoads >= 2) {
      this.isLoading = false;
    } else {
      this.iframeLoads++;
    }
  }
}
