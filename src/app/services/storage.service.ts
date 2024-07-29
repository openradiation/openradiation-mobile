import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
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
import { SplashScreen } from '@capacitor/splash-screen';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';


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
    private actions$: Actions,
    private store: Store,
    private userService: UserService,
    private platform: Platform,
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
          if (Capacitor.getPlatform() != "web") {
            StatusBar.setOverlaysWebView({ overlay: true });
            StatusBar.setStyle({ style: Style.Light });
            SplashScreen.hide();
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
      Preferences.get({ key: key }).then(rawValue => {
        if (rawValue && rawValue.value) {
          return this.parseFromDB(rawValue.value ?? "");
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
    Preferences.set({ key: this.userKey, value: this.formatToDB(user) });
  }

  saveKnownDevices(knownDevices: AbstractDevice[]) {
    Preferences.set({ key: this.knownDevicesKey, value: this.formatToDB(knownDevices) });
  }

  saveParams(params: { expertMode: boolean; autoPublish: boolean }) {
    Preferences.set({ key: this.paramsKey, value: this.formatToDB(params) });
  }

  saveMeasures(measures: (Measure | MeasureSeries)[]) {
    Preferences.set({ key: this.measuresKey, value: this.formatToDB(measures) });
  }

  saveRecentTags(recentTags: string[]) {
    Preferences.set({ key: this.recentTagsKey, value: this.formatToDB(recentTags) });
  }

  saveCurrentSeries(currentSeries?: MeasureSeries) {
    Preferences.set({ key: this.currentSeriesKey, value: currentSeries ? this.formatToDB(currentSeries) : "" });
  }

  private parseFromDB(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return undefined;
    }
  }

  private formatToDB(json: any): string {
    return JSON.stringify(json);
  }
}
