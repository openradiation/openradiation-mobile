import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { NavigationService } from '../../../../services/navigation.service';
import { AbstractDevice } from '../../../../states/devices/abstract-device';
import { DevicesState } from '../../../../states/devices/devices.state';
import { ErrorResponse, ErrorResponseCode } from '../../../../states/measures/error-response';
import { StartManualMeasure, StartMeasureSeriesParams } from '../../../../states/measures/measures.action';
import { LogIn } from '../../../../states/user/user.action';

export enum RedirectAfterLogin {
  ManualMeasure = 'manualMeasure',
  MeasureSeries = 'measureSeries'
}

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss']
})
export class LogInPage extends AutoUnsubscribePage {
  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice | undefined>;

  loginForm: FormGroup;
  connecting = false;
  redirectAfterLogin: RedirectAfterLogin;
  url = '/tabs/(settings:log-in)';

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    private navigationService: NavigationService,
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
          case RedirectAfterLogin.ManualMeasure:
            this.store.dispatch(new StartManualMeasure()).subscribe();
            break;
          case RedirectAfterLogin.MeasureSeries:
            this.store.dispatch(new StartMeasureSeriesParams());
            break;
        }
      });
  }

  goToSettings() {
    this.navigationService.goBack();
  }
}
