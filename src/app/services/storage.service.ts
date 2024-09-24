import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
import { Actions, Store } from '@ngxs/store';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { AbstractDevice } from '@app/states/devices/abstract-device';
import { InitDevices } from '@app/states/devices/devices.action';
import { DevicesStateModel } from '@app/states/devices/devices.state';
import { Measure, MeasureSeries, Params } from '@app/states/measures/measure';
import { InitMeasures } from '@app/states/measures/measures.action';
import { MeasuresStateModel } from '@app/states/measures/measures.state';
import { InitUser, SetLanguage } from '@app/states/user/user.action';
import { UserService } from '@app/states/user/user.service';
import { UserStateModel } from '@app/states/user/user.state';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { SplashScreen } from '@capacitor/splash-screen';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { environment } from '@environments/environment';
import { Storage } from '@ionic/storage';
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { AlertService } from './alert.service';


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
  private legacyDatabase: Storage

  constructor(
    private actions$: Actions,
    private store: Store,
    private userService: UserService,
    private platform: Platform,
    private alertService: AlertService
  ) { 
  }


  async migrateLegacyDatabase() {
    // TODO Uncomment this condition to run migration only once
    //if (!localStorage.getItem("legacy-database-migrated")) {
      localStorage.setItem("legacy-database-migrated", "true");
      this.legacyDatabase = new Storage({
        name: 'ord-db',
        driverOrder: [CordovaSQLiteDriver._driver]
      });
      await this.legacyDatabase.defineDriver(CordovaSQLiteDriver);
      await this.legacyDatabase.create();
      const entriesCount = await this.legacyDatabase.length();
      let message = "Connected to Legacy Database, found " + entriesCount + " entries"
      if (entriesCount > 0) {
        // copy existing data into new, encrypted format
        await this.legacyDatabase.forEach((key, value, index) => {
          message += "\n" + key + ": " + value;
          Preferences.set({ key: key, value: this.formatToDB(value) });
        });
      }

      this.alertService.show({
          header: "DEBUG",
          message: message,
          backdropDismiss: false,
          buttons: [
            {
              text: "OK"
            }
          ]
        });
    //}
  }

  async init() {
    await this.migrateLegacyDatabase();
    
    forkJoin(
      [this.getKnownDevices().pipe(
        concatMap(knownDevices => {
          return knownDevices ? this.store.dispatch(new InitDevices(knownDevices)) : of(null);
        })
      ),
      this.getUser().pipe(
        concatMap(user => {
          return user ? this.store.dispatch(new InitUser(user)) : of(null);
        })
      )]
    )
      .pipe(
        concatMap(() => this.store.dispatch(new SetLanguage())),
        concatMap(() =>
          forkJoin([this.getMeasures(), this.getParams(), this.getRecentTags(), this.getCurrentSeries()]).pipe(
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
          if (Capacitor.getPlatform() != "web"
            || environment.isTestEnvironment
          ) {
            StatusBar.setOverlaysWebView({ overlay: true });
            StatusBar.setStyle({ style: Style.Light });
            SplashScreen.hide();
            await ScreenOrientation.lock({ orientation: 'portrait' });
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

  /* eslint-disable  @typescript-eslint/no-explicit-any */
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
    } catch (_error) {
      return undefined;
    }
  }

  private formatToDB(json: any): string {
    return JSON.stringify(json);
  }
}
