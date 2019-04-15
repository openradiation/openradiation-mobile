import { ApparatusSensorType, DeviceType } from '../abstract-device';
import { AbstractUSBDevice } from './abstract-usb-device';

export class DeviceRium extends AbstractUSBDevice {
  readonly deviceType = DeviceType.Rium;
  apparatusVersion: string = DeviceType.Rium;
  apparatusSensorType = ApparatusSensorType.Geiger;
  apparatusTubeType = 'J305γβ';
  readonly pid = '2404';
  readonly vid = '03eb';
  readonly baudRate = 115200;
  readonly dataBits = 8;
  hitsPeriod = 2000;

  constructor() {
    super();
    this.sensorUUID = `${this.vid}-${this.pid}-${this.driver}`;
  }
}
