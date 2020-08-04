import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { AbstractDevice, DeviceType, RawDevice } from './abstract-device';
import { AbstractDeviceService } from './abstract-device.service';
import { DeviceAtomTagService } from './ble/device-atom-tag.service';
import { DeviceOGKitService } from './ble/device-og-kit.service';
import { DeviceRium2BLEService } from './ble/device-rium-2-ble.service';
import { DeviceSafeCastService } from './ble/device-safe-cast.service';
import { DeviceMockService } from './device-mock.service';
import { DeviceConnectionLost } from './devices.action';
import { DevicePocketGeigerService } from './usb/device-pocket-geiger.service';
import { DeviceRium2USBService } from './usb/device-rium-2-usb.service';
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
    // BLE devices
    private deviceOGKitService: DeviceOGKitService,
    private deviceAtomTagService: DeviceAtomTagService,
    private deviceSafeCastService: DeviceSafeCastService,
    private deviceRium2BLEService: DeviceRium2BLEService,
    // USB devices
    private devicePocketGeigerService: DevicePocketGeigerService,
    private deviceRiumService: DeviceRiumService,
    private deviceRium2USBService: DeviceRium2USBService
  ) {
    this.services = {
      [DeviceType.Mock]: this.deviceMockService,
      // BLE devices
      [DeviceType.OGKit]: this.deviceOGKitService,
      [DeviceType.AtomTag]: this.deviceAtomTagService,
      [DeviceType.SafeCast]: this.deviceSafeCastService,
      [DeviceType.Rium2BLE]: this.deviceRium2BLEService,
      // USB devices
      [DeviceType.PocketGeiger]: this.devicePocketGeigerService,
      [DeviceType.Rium]: this.deviceRiumService,
      [DeviceType.Rium2USB]: this.deviceRium2USBService
    };
    this.actions$.pipe(ofActionSuccessful(DeviceConnectionLost)).subscribe(({ communicationTimeout }) =>
      this.toastController
        .create({
          message: communicationTimeout
            ? this.translateService.instant('SENSORS.CONNECTION_TIMEOUT')
            : this.translateService.instant('SENSORS.CONNECTION_LOST'),
          showCloseButton: true,
          duration: communicationTimeout ? undefined : 3000,
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
