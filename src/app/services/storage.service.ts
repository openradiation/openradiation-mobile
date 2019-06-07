import { Injectable } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Actions, Store } from '@ngxs/store';
import { forkJoin, from, Observable } from 'rxjs';
import { map, mapTo } from 'rxjs/operators';
import { AbstractDevice } from '../states/devices/abstract-device';
import { InitDevices } from '../states/devices/devices.action';
import { DevicesStateModel } from '../states/devices/devices.state';
import { Measure, MeasureSeries } from '../states/measures/measure';
import { InitMeasures, InitParam, InitRecentTags } from '../states/measures/measures.action';
import { MeasuresStateModel } from '../states/measures/measures.state';
import { PositionService } from '../states/measures/position.service';
import { InitUser, SetLanguage } from '../states/user/user.action';
import { UserService } from '../states/user/user.service';
import { UserStateModel } from '../states/user/user.state';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private userKey = 'user';
  private knownDevicesKey = 'knownDevices';
  private paramsKey = 'measures.measures';
  private measuresKey = 'measures.params';
  private recentTagsKey = 'measures.recentTags';

  constructor(
    private storage: Storage,
    private actions$: Actions,
    private store: Store,
    private userService: UserService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private positionService: PositionService,
    private screenOrientation: ScreenOrientation
  ) {
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
  }

  init() {
    forkJoin(
      this.getKnownDevices().pipe(
        map(knownDevices => {
          this.store.dispatch(new InitDevices(knownDevices));
        })
      ),
      this.getParams().pipe(
        map(params => {
          this.store.dispatch(new InitParam(params));
        })
      ),
      this.getMeasures().pipe(
        map(measures => {
          this.store.dispatch(new InitMeasures(measures));
        })
      ),
      this.getRecentTags().pipe(
        map(recentTags => {
          this.store.dispatch(new InitRecentTags(recentTags));
        })
      ),
      this.getUser().pipe(
        map(user => {
          this.store.dispatch(new InitUser(user));
        })
      )
    )
      .pipe(mapTo(this.store.dispatch(new SetLanguage())))
      .subscribe(() => {
        this.store.select(({ user }: { user: UserStateModel }) => user).subscribe(user => this.saveUser(user));
        this.platform.ready().then(() => {
          if (this.platform.is('cordova')) {
            this.statusBar.overlaysWebView(true);
            this.statusBar.styleLightContent();
            this.splashScreen.hide();
            this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
            this.positionService.init();
          }
        });
      });
  }

  getUser(): Observable<UserStateModel> {
    return this.getFromDB(this.userKey);
  }

  getKnownDevices(): Observable<AbstractDevice[]> {
    return this.getFromDB(this.knownDevicesKey);
  }

  getParams(): Observable<{ expertMode: boolean; autoPublish: boolean }> {
    return this.getFromDB(this.paramsKey);
  }

  getMeasures(): Observable<(Measure | MeasureSeries)[]> {
    return this.getFromDB(this.measuresKey);
  }

  getRecentTags(): Observable<string[]> {
    return this.getFromDB(this.recentTagsKey);
  }

  private getFromDB(key: string): any {
    return from(this.storage.get(key).then(rawValue => this.parseFromDB(rawValue)));
  }

  saveUser(user: UserStateModel) {
    console.log('setUser', user);
    this.storage.set(this.userKey, this.formatToDB(user));
  }

  saveKnownDevices(knownDevices: AbstractDevice[]) {
    console.log('setDevices', knownDevices);
    this.storage.set(this.knownDevicesKey, this.formatToDB(knownDevices));
  }

  saveParams(params: { expertMode: boolean; autoPublish: boolean }) {
    console.log('setParams', params);
    this.storage.set(this.paramsKey, this.formatToDB(params));
  }

  saveMeasures(measures: (Measure | MeasureSeries)[]) {
    console.log('setMeasures', measures);
    this.storage.set(this.measuresKey, this.formatToDB(measures));
  }

  saveRecentTags(recentTags: string[]) {
    console.log('setRecentTags', recentTags);
    this.storage.set(this.recentTagsKey, this.formatToDB(recentTags));
  }

  private parseFromDB(jsonString: string): any {
    return JSON.parse(jsonString);
  }

  private formatToDB(json: any): string {
    return JSON.stringify(json);
  }
}
