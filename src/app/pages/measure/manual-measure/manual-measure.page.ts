import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manual-measure',
  templateUrl: './manual-measure.page.html',
  styleUrls: ['./manual-measure.page.scss']
})
export class ManualMeasurePage {
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
