import { Serial } from '@ionic-native/serial/ngx';
import { Observable, of } from 'rxjs';
import { AbstractDeviceService } from '../abstract-device.service';
import { AbstractUSBDevice } from './abstract-usb-device';

export abstract class AbstractUSBDeviceService<T extends AbstractUSBDevice> extends AbstractDeviceService<T> {
  constructor(protected serial: Serial) {
    super();
  }

  connectDevice(device: T): Observable<any> {
    /*this.serial
      .requestPermission({ vid: '4D8', pid: 'F46F', driver: 'CdcAcmSerialDriver' })
      .then(() => {
        this.serial
          .open({
            baudRate: 38400,
            dataBits: 4,
            stopBits: 1,
            parity: 0,
            dtr: false,
            rts: false,
            sleepOnPause: false
          })
          .then(() => {
            console.log('Serial connection opened');
          });
      })
      .catch((error: any) => console.log(error));*/
    return of(null);
  }

  disconnectDevice(device: T): Observable<any> {
    return of(null);
  }
}
