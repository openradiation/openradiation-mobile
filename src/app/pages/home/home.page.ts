import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Device } from '../../states/devices/device';
import { DevicesState } from '../../states/devices/devices.state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  @Select(DevicesState.connectedDevice) connectedDevice$: Observable<Device>;

  constructor(private router: Router) {}

  goToDevices() {
    this.router.navigate([
      'tabs',
      {
        outlets: {
          settings: 'devices'
        }
      }
    ]);
  }

  startMeasure() {}
}
