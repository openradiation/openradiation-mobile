import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subscription } from 'rxjs/index';
import { catchError } from 'rxjs/operators';
import { ErrorResponse, ErrorResponseCode } from '../../../states/measures/error-response';
import { LogIn } from '../../../states/user/user.action';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss']
})
export class LogInPage {
  loginForm: FormGroup;
  connecting = false;
  private actionsSubscription: Subscription[] = [];

  constructor(
    private router: Router,
    private store: Store,
    private formBuilder: FormBuilder,
    private actions: Actions,
    private toastController: ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ionViewDidEnter() {
    this.actionsSubscription.push(this.actions.pipe(ofActionSuccessful(LogIn)).subscribe(() => this.goToSettings()));
  }

  ionViewWillLeave() {
    this.actionsSubscription.forEach(subscription => subscription.unsubscribe());
    this.actionsSubscription = [];
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
      .subscribe();
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
