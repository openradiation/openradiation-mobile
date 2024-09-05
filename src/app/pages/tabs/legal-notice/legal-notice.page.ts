import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-legal-notice',
  templateUrl: './legal-notice.page.html',
  styleUrls: ['./legal-notice.page.scss']
})
export class LegalNoticePage implements OnInit {
  panelOpened = 1;
  appNameVersion = environment.APP_NAME_VERSION;
  logsAvailable = false

  constructor(
    private toastController: ToastController,
    private translateService: TranslateService
  ) {

  }

  ngOnInit(): void {
    this.logsAvailable = localStorage.getItem('logs') != null
  }

  async copyStackToClipBoard() {
    const existingLogFromStorage = localStorage.getItem('logs');
    navigator.clipboard?.writeText(existingLogFromStorage ? existingLogFromStorage : this.translateService.instant('LEGAL_NOTICE.LOGS.NO_LOG'))
    const toast = await this.toastController
      .create({
        message: this.translateService.instant('LEGAL_NOTICE.LOGS.COPIED'),
        duration: 3000,
        buttons: [{
          text: this.translateService.instant('GENERAL.OK'),
          role: 'cancel',
          handler: () => {
            // Nothing to do
          }
        }]
      })
    toast.present();
  }
}
