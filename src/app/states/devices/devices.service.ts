import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { AbstractDevice, DeviceType, RawDevice } from './abstract-device';
import { AbstractDeviceService } from './abstract-device.service';
import { DeviceAtomTagService } from './ble/device-atom-tag.service';
import { DeviceOGKitService } from './ble/device-og-kit.service';
import { DeviceSafeCastService } from './ble/device-safe-cast.service';
import { DeviceMockService } from './device-mock.service';
import { DeviceConnectionLost } from './devices.action';
import { DevicePocketGeigerService } from './usb/device-pocket-geiger.service';
import { DeviceRiumService } from './usb/device-rium.service';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  private services: { [K in DeviceType]: AbstractDeviceService<AbstractDevice> };

  constructor(
    private actions$: Actions,
    private toastController: ToastController,
    private translateService: TranslateService,
    private deviceMockService: DeviceMockService,
    private deviceOGKitService: DeviceOGKitService,
    private deviceAtomTagService: DeviceAtomTagService,
    private deviceSafeCastService: DeviceSafeCastService,
    private devicePocketGeigerService: DevicePocketGeigerService,
    private deviceRiumService: DeviceRiumService
  ) {
    this.services = {
      [DeviceType.Mock]: this.deviceMockService,
      [DeviceType.OGKit]: this.deviceOGKitService,
      [DeviceType.AtomTag]: this.deviceAtomTagService,
      [DeviceType.SafeCast]: this.deviceSafeCastService,
      [DeviceType.PocketGeiger]: this.devicePocketGeigerService,
      [DeviceType.Rium]: this.deviceRiumService
    };
    this.actions$.pipe(ofActionSuccessful(DeviceConnectionLost)).subscribe(() =>
      this.toastController
        .create({
          message: this.translateService.instant('SENSORS.CONNECTION_LOST'),
          showCloseButton: true,
          duration: 3000,
          closeButtonText: this.translateService.instant('GENERAL.OK')
        })
        .then(toast => toast.present())
    );
  }

  service(device: AbstractDevice): AbstractDeviceService<AbstractDevice> {
    return this.services[device.deviceType];
  }

  buildDevice(deviceType: DeviceType, rawDevice?: RawDevice): AbstractDevice | null {
    return this.services[deviceType].buildDevice(rawDevice);
  }
}
