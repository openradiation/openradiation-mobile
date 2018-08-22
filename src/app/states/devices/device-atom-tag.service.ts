import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { map } from 'rxjs/operators';
import { Measure } from '../measures/measure';
import { DeviceType } from './abstract-device';
import { DeviceAtomTag } from './device-atom-tag';

// Todo add inheritance when angular issue fixed https://github.com/angular/angular/issues/24011
@Injectable({
  providedIn: 'root'
})
export class DeviceAtomTagService /*extends AbstractDeviceService<DeviceAtomTag>*/ {
  private static firmwareServiceUUIID = '180a';
  private static firmwareCharacteristic = '2a26';
  private static serviceUUID = '63462A4A-C28C-4FFD-87A4-2D23A1C72581';
  private static settingsCharacteristic = 'ea50cfcd-ac4a-4a48-bf0e-879e548ae157';

  constructor(protected ble: BLE) {}

  getDeviceInfo(device: DeviceAtomTag): Observable<Partial<DeviceAtomTag>> {
    return fromPromise(
      this.ble.read(
        device.sensorUUID,
        DeviceAtomTagService.firmwareServiceUUIID,
        DeviceAtomTagService.firmwareCharacteristic
      )
    ).pipe(
      map(buffer => {
        const firmwareVersion = new TextDecoder('utf8').decode(new Uint8Array(buffer));
        return {
          apparatusSensorType: 'geiger',
          apparatusTubeType: 'SBM-20',
          apparatusVersion: `${DeviceType.AtomTag} ${firmwareVersion}`
        };
      })
    );
  }

  saveDeviceParams(device: DeviceAtomTag): Observable<any> {
    let command: Promise<any>;
    if (device.params.audioHits && device.params.vibrationHits) {
      command = this.sendSettingsCommand(device, 0x10).then(() => this.sendSettingsCommand(device, 0x06));
    } else if (device.params.audioHits) {
      command = this.sendSettingsCommand(device, 0x10).then(() => this.sendSettingsCommand(device, 0x04));
    } else if (device.params.vibrationHits) {
      // TODO fix vibration only mode
      command = this.sendSettingsCommand(device, 0x10).then(() => this.sendSettingsCommand(device, 0x13, 0x0011));
    } else {
      command = this.sendSettingsCommand(device, 0x0a);
    }
    return fromPromise(command);
  }

  private sendSettingsCommand(device: DeviceAtomTag, command: number, param?: number): Promise<any> {
    const dataView = new DataView(new ArrayBuffer(3));
    dataView.setUint8(0, command);
    if (param !== undefined) {
      dataView.setUint16(1, param);
    }
    console.log(dataView.buffer);
    return this.ble.write(
      device.sensorUUID,
      DeviceAtomTagService.serviceUUID,
      DeviceAtomTagService.settingsCharacteristic,
      dataView.buffer
    );
  }

  // TODO implement correct computation for AtomTag
  computeRadiationValue(measure: Measure): number {
    const duration = (measure.tsEnd - measure.tsStart) / 1000;
    const TcNet = measure.hits / duration - 0.14;
    return 0.000001 * TcNet ** 3 + 0.0025 * TcNet ** 2 + 0.39 * TcNet;
  }
}
