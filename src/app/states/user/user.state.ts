import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { LogIn, LogOut, SetLanguage } from './user.action';
import { UserService } from './user.service';

export interface UserStateModel {
  login?: string;
  password?: string;
  language?: string;
}

@State<UserStateModel>({
  name: 'user',
  defaults: {}
})
export class UserState implements NgxsOnInit {
  constructor(private userService: UserService) {}

  @Selector()
  static login(state: UserStateModel): string | undefined {
    return state.login;
  }

  @Selector()
  static language(state: UserStateModel): string | undefined {
    return state.language;
  }

  ngxsOnInit({ dispatch }: StateContext<UserStateModel>) {
    dispatch(new SetLanguage());
  }

  @Action(LogIn)
  logIn({ patchState }: StateContext<UserStateModel>, { login, password }: LogIn) {
    return this.userService.logIn(login, password).pipe(
      tap(() =>
        patchState({
          login: login,
          password: password
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
