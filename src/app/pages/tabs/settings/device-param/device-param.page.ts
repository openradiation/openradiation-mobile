import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AutoUnsubscribePage } from '@app/components/auto-unsubscribe/auto-unsubscribe.page';
import { NavigationService } from '@app/services/navigation.service';
import { AbstractDevice } from '@app/states/devices/abstract-device';
import { DeviceParamModel, DeviceParamType } from '@app/states/devices/device-params';
import { SaveDeviceParams } from '@app/states/devices/devices.action';
import { DevicesStateModel } from '@app/states/devices/devices.state';

@Component({
  selector: 'app-page-device-param',
  templateUrl: './device-param.page.html',
  styleUrls: ['./device-param.page.scss']
})
export class DeviceParamPage extends AutoUnsubscribePage {
  editedDevice: AbstractDevice | undefined;

  deviceParamType = DeviceParamType;
  editedDeviceForm: UntypedFormGroup;
  paramsModel: [string, DeviceParamModel][] = [];

  url = '/tabs/settings/device-param';

  constructor(
    protected router: Router,
    private formBuilder: UntypedFormBuilder,
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
