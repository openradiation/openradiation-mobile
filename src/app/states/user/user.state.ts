import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { from, of } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { NotificationService } from '@app/services/notification.service';
import { StorageService } from '@app/services/storage.service';
import { DisableNotifications, EnableNotifications, InitUser, LogIn, LogOut, SetLanguage } from './user.action';
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
    private storageService: StorageService,
    private notificationService: NotificationService
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
    const { language: previousLanguage, notifications } = getState();
    const newLanguage = language || previousLanguage || this.userService.getDefaultLanguage();
    return this.userService.setLanguage(newLanguage).pipe(
      concatMap(() =>
        notifications ? from(this.notificationService.useLanguage(newLanguage, previousLanguage)) : of(null)
      ),
      tap(() => patchState({ language: newLanguage }))
    );
  }

  @Action(EnableNotifications)
  enableNotifications({ getState, patchState }: StateContext<UserStateModel>) {
    const { language } = getState();
    return from(this.notificationService.enableNotifications(language)).pipe(
      tap(notifications => {
        patchState({ notifications: true });
        if (!notifications) {
          setTimeout(() => patchState({ notifications: false }), 300);
        }
      })
    );
  }

  @Action(DisableNotifications)
  disableNotifications({ getState, patchState }: StateContext<UserStateModel>) {
    const { language } = getState();
    return from(this.notificationService.disableNotifications(language)).pipe(
      tap(() => patchState({ notifications: false }))
    );
  }
}
