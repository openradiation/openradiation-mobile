import { NgModule } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Serial } from '@ionic-native/serial/ngx';
import { BLEDevicesService } from './ble/ble-devices.service';
import { DeviceAtomTagService } from './ble/device-atom-tag.service';
import { DeviceOGKitService } from './ble/device-og-kit.service';
import { DeviceSafeCastService } from './ble/device-safe-cast.service';
import { DevicesService } from './devices.service';
import { DevicePocketGeigerService } from './usb/device-pocket-geiger.service';
import { USBDevicesService } from './usb/usb-devices.service';

// Todo remove when angular issue fixed https://github.com/angular/angular/issues/24011 and switch to "provideIn"
@NgModule({
  providers: [
    BLE,
    Serial,
    DevicesService,
    BLEDevicesService,
    USBDevicesService,
    DeviceOGKitService,
    DeviceAtomTagService,
    DeviceSafeCastService,
    DevicePocketGeigerService
  ]
})
export class DevicesModule {}
