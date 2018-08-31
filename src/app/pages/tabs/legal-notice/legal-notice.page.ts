import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-legal-notice',
  templateUrl: './legal-notice.page.html',
  styleUrls: ['./legal-notice.page.scss']
})
export class LegalNoticePage {
  panelOpened = 1;
  appliNameVersion = environment.appliNameVersion;
}
