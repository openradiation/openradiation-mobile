import { Serial } from '@ionic-native/serial/ngx';
import { AbstractDeviceService } from '../abstract-device.service';
import { AbstractUSBDevice } from './abstract-usb-device';

export abstract class AbstractUSBDeviceService<T extends AbstractUSBDevice> extends AbstractDeviceService<T> {
  constructor(protected serial: Serial) {
    super();
  }
}
