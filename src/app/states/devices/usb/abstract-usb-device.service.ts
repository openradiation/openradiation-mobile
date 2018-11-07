import { Serial } from '@ionic-native/serial/ngx';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { AbstractDeviceService } from '../abstract-device.service';
import { AbstractUSBDevice } from './abstract-usb-device';

export abstract class AbstractUSBDeviceService<T extends AbstractUSBDevice> extends AbstractDeviceService<T> {
  constructor(protected store: Store, protected serial: Serial) {
    super(store);
  }

  protected getDeviceConnection(device: T): Observable<any> {
    return fromPromise(
      this.serial.open({
        baudRate: device.baudRate,
        dataBits: device.dataBits,
        stopBits: 1,
        parity: 0,
        dtr: false,
        rts: false,
        sleepOnPause: false
      })
    );
  }

  disconnectDevice(device: T): Observable<any> {
    return fromPromise(this.serial.close());
  }
}
