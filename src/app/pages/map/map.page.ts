import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})
export class MapPage {
  iframeURL: SafeResourceUrl;

  constructor(private domSanitizer: DomSanitizer, private geolocation: Geolocation) {
    this.geolocation.getCurrentPosition().then(geoposition => {
      const zoom = 12;
      const lat = geoposition.coords.latitude.toFixed(7);
      const long = geoposition.coords.longitude.toFixed(7);
      this.iframeURL = domSanitizer.bypassSecurityTrustResourceUrl(
        `${environment.INAPPBROWSER_URI}/${zoom}/${lat}/${long}`
      );
    });
  }
}
