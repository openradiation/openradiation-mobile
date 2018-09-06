import { Component, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { catchError, take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { ErrorResponse, ErrorResponseCode } from '../../../../states/measures/error-response';
import { StartManualMeasure } from '../../../../states/measures/measures.action';
import { LogIn } from '../../../../states/user/user.action';
import { TabsService } from '../../tabs.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss']
})
export class LogInPage extends AutoUnsubscribePage {
  loginForm: FormGroup;
  connecting = false;
  startMeasureAfterLogin = false;

  constructor(
    protected tabsService: TabsService,
    protected elementRef: ElementRef,
    private navController: NavController,
    private store: Store,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private actions$: Actions,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService
  ) {
    super(tabsService, elementRef);
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ionViewDidEnter() {
    super.ionViewDidEnter();
    this.activatedRoute.queryParams
      .pipe(take(1))
      .subscribe(queryParams => (this.startMeasureAfterLogin = queryParams.startMeasureAfterLogin));
    this.subscriptions.push(
      this.actions$.pipe(ofActionSuccessful(LogIn)).subscribe(() => {
        if (!this.startMeasureAfterLogin) {
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
        if (this.startMeasureAfterLogin) {
          this.store.dispatch(new StartManualMeasure());
        }
      });
  }

  goToSettings() {
    this.navController.goBack();
  }
}
