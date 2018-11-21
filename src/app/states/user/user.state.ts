import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { RetrieveV1User, LogIn, LogOut, SetLanguage } from './user.action';
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
  static login({ login }: UserStateModel): string | undefined {
    return login;
  }

  @Selector()
  static language({ language }: UserStateModel): string | undefined {
    return language;
  }

  ngxsOnInit({ dispatch }: StateContext<UserStateModel>) {
    dispatch(new SetLanguage());
    dispatch(new RetrieveV1User());
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

  @Action(RetrieveV1User)
  retrieveV1User({ patchState }: StateContext<UserStateModel>) {
    this.userService.retrieveV1User().pipe();
    // this.userService.retrieveV1User().then(value => console.log(value));
    // then(tap(result => console.log('stateData', result)));
  }
}
