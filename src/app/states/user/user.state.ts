import { Action, NgxsOnInit, Selector, State, StateContext, Store } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';
import { StorageService } from '@app/services/storage.service';
import { InitUser, LogIn, LogOut, PostFeedback, PostFeedbackError, PostFeedbackSuccess, SetLanguage } from './user.action';
import { UserService } from './user.service';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
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
    private store: Store,
    private httpClient: HttpClient,
  ) { 
  }

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

  @Action(PostFeedback)
  postFeedback({ getState }: StateContext<UserStateModel>, { message, from }: PostFeedback) {
    const { login } = getState();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${environment.MAILJET_APIKEY_PUBLIC}:${environment.MAILJET_APIKEY_PRIVATE}`)
    });
    const tos = [ { Email: "lagardealex@gmail.com" } ]
    if (from) {
      tos.push({ Email: from})
    }
    const feedbackBody = {
      "Messages":[
          {
              "From": {
                  "Email": "noreply@openradiation.org"
              },
              "To": tos,
              Subject: "Nouveau retour sur l'application OpenRadiation (" + login + ")",
              TextPart: message,
          }
      ]
    }
    this.httpClient.post("https://api.mailjet.com/v3.1/send", feedbackBody, { headers })
    .subscribe( {
      next : data => {
        if (data) {
          this.store.dispatch(new PostFeedbackSuccess());
        } else {
          this.store.dispatch(new PostFeedbackError());
        }
      },
      error : error => {
      this.store.dispatch(new PostFeedbackError(error));
      }
    })
  }
}
