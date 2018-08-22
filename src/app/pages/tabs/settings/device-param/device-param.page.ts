import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AbstractDevice, DeviceParamModel, DeviceParamType } from '../../../../states/devices/abstract-device';
import { SaveDeviceParams } from '../../../../states/devices/devices.action';
import { DevicesState, DevicesStateModel } from '../../../../states/devices/devices.state';

@Component({
  selector: 'app-page-device-param',
  templateUrl: './device-param.page.html',
  styleUrls: ['./device-param.page.scss']
})
export class DeviceParamPage {
  @Select(DevicesState.editedDevice)
  editedDevice$: Observable<AbstractDevice>;

  deviceParamType = DeviceParamType;
  editedDeviceForm: FormGroup;
  paramsModel: [string, DeviceParamModel][];

  constructor(private formBuilder: FormBuilder, private store: Store, private router: Router) {
    const editedDevice = this.store.selectSnapshot(
      ({ devices }: { devices: DevicesStateModel }) => devices.editedDevice
    );
    this.paramsModel = editedDevice && editedDevice.paramsModel ? Object.entries(editedDevice.paramsModel) : [];
    const editedDeviceForm = this.store.selectSnapshot(
      ({ devices }: { devices: DevicesStateModel }) => devices.editedDeviceForm
    );
    if (editedDeviceForm) {
      this.editedDeviceForm = this.formBuilder.group(editedDeviceForm.model);
    }
  }

  goToDevices() {
    this.store.dispatch(new SaveDeviceParams()).subscribe(() =>
      this.router
        .navigate([
          'tabs',
          {
            outlets: {
              settings: 'settings'
            }
          }
        ])
        .then(() =>
          this.router.navigate([
            'tabs',
            {
              outlets: {
                settings: 'devices'
              }
            }
          ])
        )
    );
  }
}
