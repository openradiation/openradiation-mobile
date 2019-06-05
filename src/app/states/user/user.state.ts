import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { PositionService } from '../measures/position.service';
import { LogIn, LogOut, SetLanguage } from './user.action';
import { UserService } from './user.service';

export interface UserStateModel {
  login?: string;
  password?: string;
  language?: string;
}

@State<UserStateModel>({
  name: 'user'
})
export class UserState implements NgxsOnInit {
  constructor(
    private userService: UserService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private screenOrientation: ScreenOrientation,
    private positionService: PositionService
  ) {}

  @Selector()
  static login({ login }: UserStateModel): string | undefined {
    return login;
  }

  @Selector()
  static language({ language }: UserStateModel): string | undefined {
    return language;
  }

  ngxsOnInit({ dispatch, getState }: StateContext<UserStateModel>) {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.statusBar.overlaysWebView(true);
        this.statusBar.styleLightContent();
        this.splashScreen.hide();
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        this.positionService.init();
      }
    });
    dispatch(new SetLanguage());
  }

  @Action(LogIn)
  logIn({ patchState }: StateContext<UserStateModel>, { login, password }: LogIn) {
    return this.userService.logIn(login, password).pipe(
      tap(() =>
        patchState({
          login,
          password
        })
      )
    );
  }

  @Action(LogOut)
  logOut({ patchState }: StateContext<UserStateModel>) {
    patchState({
      login: undefined,
      password: undefined
    });
  }

  @Action(SetLanguage)
  setLanguage({ getState, patchState }: StateContext<UserStateModel>, { language }: SetLanguage) {
    language = language || getState().language || this.userService.getDefaultLanguage();
    return this.userService.setLanguage(language).pipe(tap(() => patchState({ language })));
  }
}
