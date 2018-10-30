import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { catchError, take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { ErrorResponse, ErrorResponseCode } from '../../../../states/measures/error-response';
import { StartManualMeasure, StartSeriesMeasure } from '../../../../states/measures/measures.action';
import { LogIn } from '../../../../states/user/user.action';

export enum RedirectAfterLogin {
  StartMeasureAfterLogin = 'startMeasureAfterLogin',
  StartSeriesMeasureAfterLogin = 'startSeriesMeasureAfterLogin'
}

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss']
})
export class LogInPage extends AutoUnsubscribePage {
  loginForm: FormGroup;
  connecting = false;
  redirectAfterLogin: RedirectAfterLogin;
  url = '/tabs/(settings:log-in)';

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    private navController: NavController,
    private store: Store,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private actions$: Actions,
    private translateService: TranslateService
  ) {
    super(router);
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  pageEnter() {
    super.pageEnter();
    this.activatedRoute.queryParams
      .pipe(take(1))
      .subscribe(queryParams => (this.redirectAfterLogin = queryParams.redirectAfterLogin));
    this.subscriptions.push(
      this.actions$.pipe(ofActionSuccessful(LogIn)).subscribe(() => {
        if (!this.redirectAfterLogin) {
          this.goToSettings();
        }
      })
    );
  }

  onSubmit() {
    this.connecting = true;
    this.store
      .dispatch(new LogIn(this.loginForm.value.login, this.loginForm.value.password))
      .pipe(
        catchError((error: ErrorResponse) => {
          this.connecting = false;
          switch (error.code) {
            case ErrorResponseCode.WrongCredentials:
              this.toastController
                .create({
                  message: this.translateService.instant('LOG_IN.WRONG_CREDENTIALS'),
                  closeButtonText: this.translateService.instant('GENERAL.OK'),
                  duration: 5000,
                  showCloseButton: true
                })
                .then(toast => toast.present());
              break;
            default:
              this.toastController
                .create({
                  message: this.translateService.instant('GENERAL.CONNEXION_ERROR', { message: error.message }),
                  closeButtonText: this.translateService.instant('GENERAL.OK'),
                  duration: 5000,
                  showCloseButton: true
                })
                .then(toast => toast.present());
          }
          throw error;
        })
      )
      .subscribe(() => {
        switch (this.redirectAfterLogin) {
          case 'startMeasureAfterLogin':
            this.store.dispatch(new StartManualMeasure());
            break;
          case 'startSeriesMeasureAfterLogin':
            this.store.dispatch(new StartSeriesMeasure());
            break;
        }
      });
  }

  goToSettings() {
    this.navController.goBack();
  }
}
