import { Action, Selector, State, StateContext } from '@ngxs/store';
import { LogIn, LogOut } from './user.action';
import { UserService } from './user.service';
import { tap } from 'rxjs/operators';

export interface UserStateModel {
  login?: string;
  password?: string;
}

@State<UserStateModel>({
  name: 'user',
  defaults: {}
})
export class UserState {
  constructor(private userService: UserService) {}

  @Selector()
  static login(state: UserStateModel): string | undefined {
    return state.login;
  }

  @Action(LogIn)
  logIn({ patchState }: StateContext<UserStateModel>, action: LogIn) {
    return this.userService.logIn(action.login, action.password).pipe(
      tap(() =>
        patchState({
          login: action.login,
          password: action.password
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
}
