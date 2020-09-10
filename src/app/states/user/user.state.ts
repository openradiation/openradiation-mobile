import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { concatMap, tap } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';
import { StorageService } from '../../services/storage.service';
import { InitUser, LogIn, LogOut, SetLanguage } from './user.action';
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
    private storageService: StorageService,
    private notificationService: NotificationService
  ) {}

  @Selector()
  static login({ login }: UserStateModel): string | undefined {
    return login;
  }

  @Selector()
  static language({ language }: UserStateModel): string | undefined {
    return language;
  }

  ngxsOnInit({ dispatch, patchState }: StateContext<UserStateModel>) {
    this.storageService.init();
    this.notificationService.init();
  }

  @Action(InitUser)
  initUser({ patchState }: StateContext<UserStateModel>, { user }: InitUser) {
    patchState({ ...user });
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
    const previousLanguage = getState().language;
    const newLanguage = language || getState().language || this.userService.getDefaultLanguage();
    return this.userService.setLanguage(newLanguage).pipe(
      concatMap(() => this.notificationService.useLanguage(newLanguage, previousLanguage)),
      tap(() => patchState({ language: newLanguage }))
    );
  }
}
