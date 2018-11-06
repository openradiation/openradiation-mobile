import { ApparatusSensorType, DeviceType } from '../abstract-device';
import { AbstractUSBDevice } from './abstract-usb-device';

export class DevicePocketGeiger extends AbstractUSBDevice {
  readonly deviceType = DeviceType.PocketGeiger;
  driver: 'CdcAcmSerialDriver';
  pid: 'F46F';
  vid: '4D8';
  apparatusVersion: string = DeviceType.PocketGeiger;
  apparatusSensorType = ApparatusSensorType.Geiger;

  constructor() {
    super();
    this.sensorUUID = `${this.vid}-${this.pid}-${this.driver}`;
  }
}
