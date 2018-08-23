import { Component, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { catchError, take } from 'rxjs/operators';
import { ErrorResponse, ErrorResponseCode } from '../../../../states/measures/error-response';
import { StartManualMeasure } from '../../../../states/measures/measures.action';
import { LogIn } from '../../../../states/user/user.action';
import { AutoUnsubscribePage } from '../../../../components/page/auto-unsubscribe.page';
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
    private router: Router,
    private store: Store,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private actions$: Actions,
    private activatedRoute: ActivatedRoute
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
                  message: 'Identifiants incorrects',
                  closeButtonText: 'Ok',
                  duration: 5000,
                  showCloseButton: true
                })
                .then(toast => toast.present());
              break;
            default:
              this.toastController
                .create({
                  message: `Connexion impossible : ${error.message}`,
                  closeButtonText: 'Ok',
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
    this.router.navigate([
      'tabs',
      {
        outlets: {
          settings: 'settings'
        }
      }
    ]);
  }
}
