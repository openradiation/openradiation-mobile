import { ApparatusSensorType, DeviceType } from '../abstract-device';
import { AbstractUSBDevice } from './abstract-usb-device';

export class DeviceRium extends AbstractUSBDevice {
  readonly deviceType = DeviceType.Rium;
  apparatusVersion: string = DeviceType.Rium;
  apparatusSensorType = ApparatusSensorType.Geiger;
  readonly pid = '9220';
  readonly vid = '1003';
  readonly baudRate = 115200; // ?
  readonly dataBits = 8;
  hitsPeriod = 100; // ?

  constructor() {
    super();
    this.sensorUUID = `${this.vid}-${this.pid}-${this.driver}`;
  }
}
