import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { StorageService } from '@app/services/storage.service';
import { InitUser, LogIn, LogOut, SetLanguage } from './user.action';
import { UserService } from './user.service';
import { Injectable } from '@angular/core';
export interface UserStateModel {
  login?: string;
  password?: string;
  language?: string;
  notifications?: boolean;
}

@State<UserStateModel>({
  name: 'user'
})
@Injectable()
export class UserState implements NgxsOnInit {
  constructor(
    private userService: UserService,
    private storageService: StorageService
  ) { }

  @Selector()
  static login({ login }: UserStateModel): string | undefined {
    return login;
  }

  @Selector()
  static language({ language }: UserStateModel): string | undefined {
    return language;
  }

  @Selector()
  static notifications({ notifications }: UserStateModel): boolean | undefined {
    return notifications;
  }

  ngxsOnInit(_stateContext: StateContext<UserStateModel>) {
    this.storageService.init();
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
    const { language: previousLanguage } = getState();
    const newLanguage = language || previousLanguage || this.userService.getDefaultLanguage();
    return this.userService.setLanguage(newLanguage).pipe(
      tap(() => patchState({ language: newLanguage }))
    );
  }
}
