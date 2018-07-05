import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';
import { environment } from '../../../environments/environment';
import { Network } from '@ionic-native/network/ngx';
import { take } from 'rxjs/operators';

/**
 * Constants from cordova-plugin-network-information to get network types
 */
declare var Connection: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})
export class MapPage {
  iframeURL: SafeResourceUrl;
  isLoading = false;
  connectionAvailable = true;
  private iframeLoads = 0;

  constructor(
    private domSanitizer: DomSanitizer,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic,
    private platform: Platform,
    private network: Network
  ) {
    if (this.platform.is('cordova')) {
      if (this.network.type === Connection.NONE || this.network.type === Connection.UNKNOWN) {
        this.connectionAvailable = false;
        this.network
          .onConnect()
          .pipe(take(1))
          .subscribe(() => {
            this.connectionAvailable = true;
            this.loadMap();
          });
      } else {
        this.loadMap();
      }
    } else {
      this.loadMap();
    }
  }

  private loadMap() {
    this.isLoading = true;
    if (this.platform.is('cordova')) {
      this.isLoading = true;
      this.diagnostic.isLocationAvailable().then(locationAvailable => {
        if (locationAvailable) {
          this.geolocation.getCurrentPosition().then(geoposition => {
            const zoom = 12;
            const lat = geoposition.coords.latitude.toFixed(7);
            const long = geoposition.coords.longitude.toFixed(7);
            this.iframeURL = this.domSanitizer.bypassSecurityTrustResourceUrl(
              `${environment.INAPPBROWSER_URI}/${zoom}/${lat}/${long}`
            );
          });
        } else {
          this.iframeURL = this.domSanitizer.bypassSecurityTrustResourceUrl(environment.INAPPBROWSER_URI);
        }
      });
    } else {
      this.iframeURL = this.domSanitizer.bypassSecurityTrustResourceUrl(environment.INAPPBROWSER_URI);
    }
  }

  mapLoaded() {
    if (this.iframeLoads >= 1) {
      this.isLoading = false;
    } else {
      this.iframeLoads++;
    }
  }
}
