import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { DevicesState } from '../../states/device/devices.state';
import { Observable } from 'rxjs/internal/Observable';
import { Device } from '../../states/device/device';

@Component({
  selector: 'app-page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  @Select(DevicesState.connectedDevice) connectedDevice$: Observable<Device>;

  constructor() {}

  startMeasure() {}
}
