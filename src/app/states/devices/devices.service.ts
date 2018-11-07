import { Injectable } from '@angular/core';
import { AbstractDevice, DeviceType } from './abstract-device';
import { AbstractDeviceService } from './abstract-device.service';
import { DeviceAtomTagService } from './ble/device-atom-tag.service';
import { DeviceOGKitService } from './ble/device-og-kit.service';
import { DeviceSafeCastService } from './ble/device-safe-cast.service';
import { DevicePocketGeigerService } from './usb/device-pocket-geiger.service';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {
  private services: { [K in DeviceType]: AbstractDeviceService<AbstractDevice> };

  constructor(
    private deviceOGKitService: DeviceOGKitService,
    private deviceAtomTagService: DeviceAtomTagService,
    private deviceSafeCastService: DeviceSafeCastService,
    private devicePocketGeigerService: DevicePocketGeigerService
  ) {
    this.services = {
      [DeviceType.OGKit]: this.deviceOGKitService,
      [DeviceType.AtomTag]: this.deviceAtomTagService,
      [DeviceType.SafeCast]: this.deviceSafeCastService,
      [DeviceType.PocketGeiger]: this.devicePocketGeigerService
    };
  }

  service(device: AbstractDevice): AbstractDeviceService<AbstractDevice> {
    return this.services[device.deviceType];
  }
}
