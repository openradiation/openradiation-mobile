import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Actions, InitState, Store } from '@ngxs/store';
import { DevicesStateModel } from '../states/devices/devices.state';
import { MeasuresStateModel } from '../states/measures/measures.state';
import { UserStateModel } from '../states/user/user.state';
import { forkJoin, from, Observable } from 'rxjs';
import { InitUser, SetLanguage } from '../states/user/user.action';
import { map, mapTo, tap } from 'rxjs/operators';
import { AbstractDevice } from '../states/devices/abstract-device';
import { InitDevices } from '../states/devices/devices.action';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private userKey = 'user';
  private knownDevicesKey = 'knownDevices';

  constructor(private storage: Storage, private actions$: Actions, private store: Store) {
    this.store
      .select(({ devices }: { devices: DevicesStateModel }) => devices.knownDevices)
      .subscribe(log => console.log('devices', log));
    this.store
      .select(({ measures }: { measures: MeasuresStateModel }) => measures.measures)
      .subscribe(log => console.log('measures', log));
    this.store
      .select(({ measures }: { measures: MeasuresStateModel }) => measures.params)
      .subscribe(log => console.log('params', log));
    this.store
      .select(({ measures }: { measures: MeasuresStateModel }) => measures.recentTags)
      .subscribe(log => console.log('recentTags', log));
  }

  init() {
    forkJoin(
      this.getKnownDevices().pipe(
        map(knownDevices => {
          this.store.dispatch(new InitDevices(knownDevices));
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
        /*this.platform.ready().then(() => {
        if (this.platform.is('cordova')) {
          this.statusBar.overlaysWebView(true);
          this.statusBar.styleLightContent();
          this.splashScreen.hide();
          this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
          this.positionService.init();
        }
      });*/
      });
  }

  getUser(): Observable<UserStateModel> {
    return this.getFromDB(this.userKey);
  }

  getKnownDevices(): Observable<AbstractDevice[]> {
    return this.getFromDB(this.knownDevicesKey);
  }

  private getFromDB(key: string): any {
    return from(this.storage.get(key).then(rawValue => this.parseFromDB(rawValue)));
  }

  saveUser(user: UserStateModel) {
    console.log('setUser', user);
    this.storage.set(this.userKey, this.formatToDB(user));
  }

  saveKnownDevices(devices: DevicesStateModel) {
    console.log('setDevices', devices.knownDevices);
    this.storage.set('devices.knownDevices', this.formatToDB(devices.knownDevices));
  }

  saveMeasures(measures: MeasuresStateModel) {
    console.log('setMeasures', measures.measures, measures.params, measures.recentTags);
    this.storage.set('measures.measures', this.formatToDB(measures.measures));
    this.storage.set('measures.params', this.formatToDB(measures.params));
    this.storage.set('measures.recentTags', this.formatToDB(measures.recentTags));
  }

  private parseFromDB(jsonString: string): any {
    return JSON.parse(jsonString);
  }

  private formatToDB(json: any): string {
    return JSON.stringify(json);
  }
}
