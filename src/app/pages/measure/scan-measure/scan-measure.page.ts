import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scan-measure',
  templateUrl: './scan-measure.page.html',
  styleUrls: ['./scan-measure.page.scss']
})
export class ScanMeasurePage {
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
