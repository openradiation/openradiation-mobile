import { ApparatusSensorType, DeviceType } from '../abstract-device';
import { AbstractUSBDevice } from './abstract-usb-device';

export class DevicePocketGeiger extends AbstractUSBDevice {
  readonly deviceType = DeviceType.PocketGeiger;
  apparatusVersion: string = DeviceType.PocketGeiger;
  apparatusSensorType = ApparatusSensorType.Geiger;
  readonly pid = 'F46F';
  readonly vid = '4D8';
  readonly baudRate = 38400;
  readonly dataBits = 8;
  hitsPeriod = 100;

  constructor() {
    super();
    this.sensorUUID = `${this.vid}-${this.pid}-${this.driver}`;
  }
}
