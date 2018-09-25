import { ChangeDetectorRef, Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Platform } from '@ionic/angular';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { UserState } from '../../../states/user/user.state';
import { PositionChanged, StartWatchPosition, StopWatchPosition } from '../../../states/measures/measures.action';
import { MeasuresStateModel } from '../../../states/measures/measures.state';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { Router } from '@angular/router';

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

  iframeURL: SafeResourceUrl;
  isLoading = false;
  connectionAvailable = true;
  private iframeLoads = 0;

  url = '/tabs/(map:map)';

  constructor(
    protected router: Router,
    private domSanitizer: DomSanitizer,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic,
    private platform: Platform,
    private network: Network,
    private store: Store,
    private actions$: Actions,
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
    this.isLoading = true;
    // TODO: put the language in the url when the API will be fixed
    let url = `${environment.IN_APP_BROWSER_URI.base}/${environment.IN_APP_BROWSER_URI.suffix}`;
    this.store.dispatch(new StartWatchPosition());
    this.subscriptions.push(
      this.actions$.pipe(ofActionSuccessful(PositionChanged)).subscribe(() => {
        const { latitude, longitude } = this.store.selectSnapshot(
          ({ measures }: { measures: MeasuresStateModel }) => measures.currentPosition!.coords
        );
        const lat = latitude.toFixed(7);
        const long = longitude.toFixed(7);
        const zoom = 12;
        url += `/${zoom}/${lat}/${long}`;
        this.store.dispatch(new StopWatchPosition());
        this.iframeURL = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
        this.changeDetectorRef.markForCheck();
      })
    );
    this.iframeURL = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
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
    this.store.dispatch(new StopWatchPosition());
  }
}
