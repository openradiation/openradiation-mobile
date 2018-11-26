import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { LogIn, LogOut, RetrieveV1User, SetLanguage } from './user.action';
import { UserService } from './user.service';
import { V1MigrationService } from '../../services/v1-migration.service';

export interface UserStateModel {
  login?: string;
  password?: string;
  language?: string;
  retrieveV1UserCheck: boolean;
}

@State<UserStateModel>({
  name: 'user',
  defaults: {
    retrieveV1UserCheck: false
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
    const { retrieveV1UserCheck } = getState();
    dispatch(new SetLanguage());
    if (!retrieveV1UserCheck) {
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
    this.v1MigrationService
      .retrieveUser()
      .then(({ login, password }) => {
        patchState({
          login,
          password,
          retrieveV1UserCheck: true
        });
      })
      .catch(() => {
        patchState({
          retrieveV1UserCheck: true
        });
      });
  }
}
