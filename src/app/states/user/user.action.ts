import { UserStateModel } from './user.state';

export class InitUser {
  static readonly type = '[User] Init';
  constructor(public user: UserStateModel) {}
}

export class LogIn {
  static readonly type = '[User] Log in';
  constructor(public login: string, public password: string) {}
}

export class LogOut {
  static readonly type = '[User] Log out';
}

export class SetLanguage {
  static readonly type = '[User] Set language';
  constructor(public language?: string) {}
}

export class PostFeedback {
  static readonly type = '[User] Post feedback';
  constructor(public message?: string, public from?: string) {}
}

export class PostFeedbackSuccess {
  static readonly type = '[User] Post feedback success';
}
export class PostFeedbackError {
  static readonly type = '[User] Post feedback failure';
  constructor(public error?: Error) {}
}