import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AutoUnsubscribePage } from '../../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { NavigationService } from '../../../../services/navigation.service';
import { AbstractDevice } from '../../../../states/devices/abstract-device';
import { DeviceParamModel, DeviceParamType } from '../../../../states/devices/device-params';
import { SaveDeviceParams } from '../../../../states/devices/devices.action';
import { DevicesStateModel } from '../../../../states/devices/devices.state';

@Component({
  selector: 'app-page-device-param',
  templateUrl: './device-param.page.html',
  styleUrls: ['./device-param.page.scss']
})
export class DeviceParamPage extends AutoUnsubscribePage {
  editedDevice: AbstractDevice | undefined;

  deviceParamType = DeviceParamType;
  editedDeviceForm: FormGroup;
  paramsModel: [string, DeviceParamModel][] = [];

  url = '/tabs/settings/device-param';

  constructor(
    protected router: Router,
    private formBuilder: FormBuilder,
    private store: Store,
    private navigationService: NavigationService
  ) {
    super(router);
  }

  pageEnter() {
    super.pageEnter();
    const editedDevice = this.store.selectSnapshot(
      ({ devices }: { devices: DevicesStateModel }) => devices.editedDevice
    );
    this.editedDevice = editedDevice;
    this.paramsModel = editedDevice && editedDevice.paramsModel ? Object.entries(editedDevice.paramsModel) : [];
    const editedDeviceForm = this.store.selectSnapshot(
      ({ devices }: { devices: DevicesStateModel }) => devices.editedDeviceForm
    );
    if (editedDeviceForm) {
      this.editedDeviceForm = this.formBuilder.group(editedDeviceForm.model);
    }
  }

  goBack() {
    this.navigationService.goBack();
  }

  pageLeave() {
    super.pageLeave();
    this.store.dispatch(new SaveDeviceParams()).subscribe();
  }
}
