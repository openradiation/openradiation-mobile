import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { V1MigrationService } from '../../services/v1-migration.service';
import { LogIn, LogOut, RetrieveV1User, SetLanguage } from './user.action';
import { UserService } from './user.service';

export interface UserStateModel {
  login?: string;
  password?: string;
  language?: string;
  v1UserRetrieved: boolean;
}

@State<UserStateModel>({
  name: 'user',
  defaults: {
    v1UserRetrieved: false
  }
})
export class UserState implements NgxsOnInit {
  constructor(private userService: UserService, private v1MigrationService: V1MigrationService) {}

  @Selector()
  static login({ login }: UserStateModel): string | undefined {
    return login;
  }

  @Selector()
  static language({ language }: UserStateModel): string | undefined {
    return language;
  }

  ngxsOnInit({ dispatch, getState }: StateContext<UserStateModel>) {
    const { v1UserRetrieved } = getState();
    dispatch(new SetLanguage());
    if (!v1UserRetrieved) {
      dispatch(new RetrieveV1User());
    }
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

  @Action(RetrieveV1User)
  retrieveV1User({ patchState }: StateContext<UserStateModel>) {
    return this.v1MigrationService
      .retrieveUser()
      .then(({ login, password }) => {
        patchState({
          login,
          password,
          v1UserRetrieved: true
        });
      })
      .catch(() => {
        patchState({
          v1UserRetrieved: true
        });
      });
  }
}
