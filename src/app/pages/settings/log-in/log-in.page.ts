import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subscription } from 'rxjs/index';
import { LogIn } from '../../../states/user/user.action';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss']
})
export class LogInPage {
  loginForm: FormGroup;
  private actionsSubscription: Subscription[] = [];

  constructor(
    private router: Router,
    private store: Store,
    private formBuilder: FormBuilder,
    private actions: Actions
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
    this.store.dispatch(new LogIn(this.loginForm.value.login, this.loginForm.value.password));
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
