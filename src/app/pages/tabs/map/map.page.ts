import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Platform } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Select } from '@ngxs/store';
import { UserState } from '../../../states/user/user.state';
import { Observable } from 'rxjs';

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
  @Select(UserState.language)
  language$: Observable<string | undefined>;

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
    this.language$.subscribe(language => {
      this.isLoading = true;
      let url = `${environment.IN_APP_BROWSER_URI.base}${
        language === 'fr' || language === 'en' ? '/' + language : ''
      }/${environment.IN_APP_BROWSER_URI.suffix}`;
      if (this.platform.is('cordova')) {
        this.isLoading = true;
        this.diagnostic.isLocationAvailable().then(locationAvailable => {
          if (locationAvailable) {
            this.geolocation.getCurrentPosition().then(geoposition => {
              const zoom = 12;
              const lat = geoposition.coords.latitude.toFixed(7);
              const long = geoposition.coords.longitude.toFixed(7);
              url += `/${environment.IN_APP_BROWSER_URI}/${zoom}/${lat}/${long}`;
            });
          }
        });
      }
      this.iframeURL = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    });
  }

  mapLoaded() {
    if (this.iframeLoads >= 1) {
      this.isLoading = false;
    } else {
      this.iframeLoads++;
    }
  }
}
