export class LogIn {
  static readonly type = '[User] Log in';
  constructor(public login: string, public password: string) {}
}

export class LogOut {
  static readonly type = '[User] Log out';
}
