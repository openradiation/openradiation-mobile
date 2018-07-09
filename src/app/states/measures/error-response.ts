export interface ErrorResponse {
  code: ErrorResponseCode;
  message: string;
}

export enum ErrorResponseCode {
  Unknown = '-1',
  WrongCredentials = '102'
}
