import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ErrorResponse, ErrorResponseCode } from '../measures/error-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private allowedLanguages = ['en', 'fr'];

  constructor(private httpClient: HttpClient, private translateService: TranslateService) {
    this.translateService.setDefaultLang('en');
  }

  logIn(login: string, password: string): Observable<any> {
    return this.httpClient
      .post(environment.API_URI, {
        apiKey: environment.API_KEY,
        data: {
          latitude: 48.23456,
          longitude: 2.657723,
          value: 0.065,
          reportUuid: '110e8422-e29b-11d4-a716-446655440001',
          startTime: '2016-05-23T08:49:59.000Z',
          reportContext: 'test',
          userId: login,
          userPwd: password
        }
      })
      .pipe(
        catchError(
          (err: HttpErrorResponse): Observable<ErrorResponse> => {
            if (err.error.error) {
              throw err.error.error;
            } else {
              throw {
                code: ErrorResponseCode.Unknown,
                message: 'unknow error'
              };
            }
          }
        )
      );
  }

  setLanguage(language: string): Observable<any> {
    return this.translateService.use(language);
  }

  getDefaultLanguage(): string {
    const userLang = this.translateService.getBrowserLang();
    if (this.allowedLanguages.includes(userLang)) {
      return userLang;
    } else {
      return this.translateService.getDefaultLang();
    }
  }
}
