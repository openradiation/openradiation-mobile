import { ChangeDetectorRef, Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Network } from '@ionic-native/network/ngx';
import { Platform } from '@ionic/angular';
import { Select } from '@ngxs/store';
import { Location } from 'cordova-plugin-mauron85-background-geolocation';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { MeasuresState } from '../../../states/measures/measures.state';
import { UserState } from '../../../states/user/user.state';

/**
 * Constants from cordova-plugin-network-information to get network types
 */
declare var Connection: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})
export class MapPage extends AutoUnsubscribePage {
  @Select(UserState.language)
  language$: Observable<string | undefined>;
  @Select(MeasuresState.currentPosition)
  currentPosition$: Observable<Location | undefined>;

  iframeURL: SafeResourceUrl;
  isLoading = false;
  connectionAvailable = true;
  private iframeLoads = 0;

  url = '/tabs/map';

  constructor(
    protected router: Router,
    private domSanitizer: DomSanitizer,
    private platform: Platform,
    private network: Network,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(router);
  }

  pageEnter() {
    super.pageEnter();
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
      this.iframeURL = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
      this.currentPosition$.pipe(take(1)).subscribe(currentPosition => {
        if (currentPosition) {
          const lat = currentPosition.latitude.toFixed(7);
          const long = currentPosition.longitude.toFixed(7);
          const zoom = 12;
          url += `/${zoom}/${lat}/${long}`;
          this.iframeURL = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
          this.changeDetectorRef.markForCheck();
        }
      });
    });
  }

  mapLoaded() {
    if (this.iframeLoads >= 1) {
      this.isLoading = false;
    } else {
      this.iframeLoads++;
    }
  }

  pageLeave() {
    super.pageLeave();
    this.isLoading = false;
  }
}
