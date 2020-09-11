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

export class EnableNotifications {
  static readonly type = '[User] Enable notifications';
}

export class DisableNotifications {
  static readonly type = '[User] Disable notifications';
}
