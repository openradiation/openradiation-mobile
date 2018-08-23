import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-measure-report',
  templateUrl: './measure-report.page.html',
  styleUrls: ['./measure-report.page.scss']
})
export class MeasureReportPage {
  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate([
      'tabs',
      {
        outlets: {
          home: 'home'
        }
      }
    ]);
  }
}
