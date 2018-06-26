import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})
export class MapPage {
  iframeURL: SafeResourceUrl;

  constructor(private domSanitizer: DomSanitizer) {
    this.iframeURL = domSanitizer.bypassSecurityTrustResourceUrl(environment.INAPPBROWSER_URI);
  }
}
