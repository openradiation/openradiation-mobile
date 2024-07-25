import { Injectable } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Actions, Store } from '@ngxs/store';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { AbstractDevice } from '../states/devices/abstract-device';
import { InitDevices } from '../states/devices/devices.action';
import { DevicesStateModel } from '../states/devices/devices.state';
import { Measure, MeasureSeries, Params } from '../states/measures/measure';
import { InitMeasures } from '../states/measures/measures.action';
import { MeasuresStateModel } from '../states/measures/measures.state';
import { PositionService } from '../states/measures/position.service';
import { EnableNotifications, InitUser, SetLanguage } from '../states/user/user.action';
import { UserService } from '../states/user/user.service';
import { UserStateModel } from '../states/user/user.state';
import { ScreenOrientation } from '@capacitor/screen-orientation';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private userKey = 'user';
  private knownDevicesKey = 'devices.knownDevices';
  private paramsKey = 'measures.params';
  private measuresKey = 'measures.measures';
  private recentTagsKey = 'measures.recentTags';
  private currentSeriesKey = 'measures.currentSeries';

  constructor(
    private storage: Storage,
    private actions$: Actions,
    private store: Store,
    private userService: UserService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private positionService: PositionService
  ) { }

  init() {
    forkJoin(
      this.getKnownDevices().pipe(
        concatMap(knownDevices => {
          return knownDevices ? this.store.dispatch(new InitDevices(knownDevices)) : of(null);
        })
      ),
      this.getUser().pipe(
        concatMap(user => {
          return user ? this.store.dispatch(new InitUser(user)) : of(null);
        })
      )
    )
      .pipe(
        concatMap(() => this.store.dispatch(new SetLanguage())),
        concatMap(() => {
          const { notifications } = this.store.snapshot().user;

          return notifications || notifications === undefined
            ? this.store.dispatch(new EnableNotifications())
            : of(null);
        }),
        concatMap(() =>
          forkJoin(this.getMeasures(), this.getParams(), this.getRecentTags(), this.getCurrentSeries()).pipe(
            concatMap(([measures, params, recentTags, currentSeries]) => {
              return measures && params && recentTags
                ? this.store.dispatch(new InitMeasures(measures, params, recentTags, currentSeries || undefined))
                : of(null);
            })
          )
        )
      )
      .subscribe(() => {
        this.store.select(({ user }: { user: UserStateModel }) => user).subscribe(user => this.saveUser(user));
        this.store
          .select(({ devices }: { devices: DevicesStateModel }) => devices.knownDevices)
          .subscribe(knownDevices => this.saveKnownDevices(knownDevices));
        this.store
          .select(({ measures }: { measures: MeasuresStateModel }) => measures.measures)
          .subscribe(measures => this.saveMeasures(measures));
        this.store
          .select(({ measures }: { measures: MeasuresStateModel }) => measures.params)
          .subscribe(params => this.saveParams(params));
        this.store
          .select(({ measures }: { measures: MeasuresStateModel }) => measures.recentTags)
          .subscribe(recentTags => this.saveRecentTags(recentTags));
        this.store
          .select(({ measures }: { measures: MeasuresStateModel }) => measures.currentSeries)
          .subscribe(currentSeries => this.saveCurrentSeries(currentSeries));
        this.platform.ready().then(async () => {
          if (this.platform.is('cordova')) {
            this.statusBar.overlaysWebView(true);
            this.statusBar.styleLightContent();
            this.splashScreen.hide();
            await ScreenOrientation.lock({ orientation: 'portrait' });
            this.positionService.init();
          }
        });
      });
  }

  getUser(): Observable<UserStateModel | null> {
    return this.getFromDB(this.userKey);
  }

  getKnownDevices(): Observable<AbstractDevice[] | null> {
    return this.getFromDB(this.knownDevicesKey);
  }

  getParams(): Observable<Params | null> {
    return this.getFromDB(this.paramsKey);
  }

  getMeasures(): Observable<(Measure | MeasureSeries)[] | null> {
    return this.getFromDB(this.measuresKey);
  }

  getRecentTags(): Observable<string[] | null> {
    return this.getFromDB(this.recentTagsKey);
  }

  getCurrentSeries(): Observable<MeasureSeries | null> {
    return this.getFromDB(this.currentSeriesKey);
  }

  private getFromDB(key: string): any {
    return from(
      this.storage.get(key).then(rawValue => {
        if (rawValue) {
          return this.parseFromDB(rawValue);
        } else {
          const retrieveLocalStorageData = localStorage.getItem(key);
          if (retrieveLocalStorageData) {
            return this.parseFromDB(retrieveLocalStorageData);
          } else {
            return null;
          }
        }
      })
    );
  }

  saveUser(user: UserStateModel) {
    this.storage.set(this.userKey, this.formatToDB(user));
  }

  saveKnownDevices(knownDevices: AbstractDevice[]) {
    this.storage.set(this.knownDevicesKey, this.formatToDB(knownDevices));
  }

  saveParams(params: { expertMode: boolean; autoPublish: boolean }) {
    this.storage.set(this.paramsKey, this.formatToDB(params));
  }

  saveMeasures(measures: (Measure | MeasureSeries)[]) {
    this.storage.set(this.measuresKey, this.formatToDB(measures));
  }

  saveRecentTags(recentTags: string[]) {
    this.storage.set(this.recentTagsKey, this.formatToDB(recentTags));
  }

  saveCurrentSeries(currentSeries?: MeasureSeries) {
    this.storage.set(this.currentSeriesKey, currentSeries ? this.formatToDB(currentSeries) : null);
  }

  private parseFromDB(jsonString: string): any {
    return JSON.parse(jsonString);
  }

  private formatToDB(json: any): string {
    return JSON.stringify(json);
  }
}
