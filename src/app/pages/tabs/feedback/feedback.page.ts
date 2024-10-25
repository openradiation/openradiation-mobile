import { Component, OnInit } from '@angular/core';
import { PostFeedback, PostFeedbackError, PostFeedbackSuccess } from '@app/states/user/user.action';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {
  public feedbackMessage = ""
  public feedbackFrom=""
  constructor(
    private actions$: Actions,
    private toastController: ToastController,
    private translateService: TranslateService,
    private store: Store) { 
      
    }

  ngOnInit() {
    this.actions$
      .pipe(ofActionSuccessful(PostFeedbackError))
      .subscribe(() => {
          this.toastController
                    .create({
                      message: this.translateService.instant('FEEDBACK.FAILURE'),
                      duration: 3000,
                      buttons: [{
                        text: this.translateService.instant('GENERAL.OK'),
                        role: 'cancel',
                        handler: () => {
                          // Nothing to do
                        }
                      }]
                    })
                    .then(toast => toast.present());
      });
    this.actions$
      .pipe(ofActionSuccessful(PostFeedbackSuccess))
      .subscribe(() => {
        this.toastController
                  .create({
                    message: this.translateService.instant('FEEDBACK.SUCCESS'),
                    duration: 3000,
                    buttons: [{
                      text: this.translateService.instant('GENERAL.OK'),
                      role: 'cancel',
                      handler: () => {
                        // Nothing to do
                      }
                    }]
                  })
                  .then(toast => toast.present());
      });
  }


  postFeedback() {
     this.store.dispatch(new PostFeedback(this.feedbackMessage, this.feedbackFrom));
  }
}
