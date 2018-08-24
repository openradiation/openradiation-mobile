import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Observable, of } from 'rxjs';
import { filter, map, scan, shareReplay, take, tap } from 'rxjs/operators';
import { Measure, Step } from '../measures/measure';
import { DeviceOGKit } from './device-og-kit';

// Todo add inheritance when angular issue fixed https://github.com/angular/angular/issues/24011
@Injectable({
  providedIn: 'root'
})
export class DeviceOGKitService /*extends AbstractDeviceService<DeviceOGKit>*/ {
  private serviceUUID = '00002220-0000-1000-8000-00805F9B34FB';
  private sendCharacteristic = '00002222-0000-1000-8000-00805F9B34FB';
  private receiveCharacteristic = '00002221-0000-1000-8000-00805F9B34FB';

  private IN_PACKAGE_GET_INFO = 0x12;
  private OUT_PACKAGE_SENSOR_TYPE = 3;
  private OUT_PACKAGE_TUBE_TYPE = 16;

  private IN_PACKET_SET_VOLTAGE = 0x11;
  private tubesVoltageProfile: { [K: string]: { min: number; max: number; setVoltageOnPayload: number[] } } = {
    'SBM-20': {
      min: 340,
      max: 400,
      setVoltageOnPayload: [0x00, 0x00, 0xbe, 0x43]
    },
    M4011: {
      min: 340,
      max: 420,
      setVoltageOnPayload: [0x00, 0x00, 0xc8, 0x43]
    },
    'STS-5': {
      min: 340,
      max: 400,
      setVoltageOnPayload: [0x00, 0x00, 0xc8, 0x43]
    }
  };

  private OUT_PACKET_HIT = 5;
  private OUT_PACKET_HIT_POSITION = 0;
  private OUT_PACKET_TEMPERATURE = 6;
  private OUT_PACKET_TEMPERATURE_POSITION = 2;
  private OUT_PACKET_VOLTAGE = 18;
  private OUT_PACKET_VOLTAGE_POSITION = 9;

  constructor(protected ble: BLE) {}

  getDeviceInfo(device: DeviceOGKit): Observable<Partial<DeviceOGKit>> {
    const startNotification = this.ble
      .startNotification(device.sensorUUID, this.serviceUUID, this.receiveCharacteristic)
      .pipe(shareReplay());
    startNotification.subscribe();
    const data = new Uint8Array([this.IN_PACKAGE_GET_INFO]);
    this.ble.write(device.sensorUUID, this.serviceUUID, this.sendCharacteristic, <ArrayBuffer>data.buffer);
    return this.ble.startNotification(device.sensorUUID, this.serviceUUID, this.receiveCharacteristic).pipe(
      scan((update: Partial<DeviceOGKit>, buffer: ArrayBuffer) => {
        const array = new Uint8Array(buffer);
        switch (array[0]) {
          case this.OUT_PACKAGE_SENSOR_TYPE:
            update.apparatusSensorType = this.decodeStringArray(array);
            break;
          case this.OUT_PACKAGE_TUBE_TYPE:
            update.apparatusTubeType = this.decodeStringArray(array);
            break;
        }
        return update;
      }, {}),
      filter(update => update.apparatusSensorType !== undefined && update.apparatusTubeType !== undefined),
      take(1),
      tap(() => this.ble.stopNotification(device.sensorUUID, this.serviceUUID, this.receiveCharacteristic))
    );
  }

  saveDeviceParams(device: DeviceOGKit): Observable<any> {
    return of(null);
  }

  computeRadiationValue(measure: Measure): number {
    const duration = (measure.endTime - measure.startTime) / 1000;
    const TcNet = measure.hitsNumber / duration - 0.14;
    return 0.000001 * TcNet ** 3 + 0.0025 * TcNet ** 2 + 0.39 * TcNet;
  }

  startMeasureScan(device: DeviceOGKit): Observable<any> {
    this.setTubeVoltageOn(device);
    return this.ble.startNotification(device.sensorUUID, this.serviceUUID, this.receiveCharacteristic).pipe(
      filter((buffer: ArrayBuffer) => {
        const dataPackage = this.decodeDataPackage(buffer);
        console.log(dataPackage);
        if (dataPackage) {
          return dataPackage.voltage > this.tubesVoltageProfile[device.apparatusTubeType].min;
        } else {
          return false;
        }
      }),
      take(1),
      tap(() => this.ble.stopNotification(device.sensorUUID, this.serviceUUID, this.receiveCharacteristic))
    );
  }

  getSteps(device: DeviceOGKit, stopSignal: Observable<any>): Observable<Step> {
    stopSignal.subscribe(() =>
      this.ble.stopNotification(device.sensorUUID, this.serviceUUID, this.receiveCharacteristic)
    );
    return this.ble.startNotification(device.sensorUUID, this.serviceUUID, this.receiveCharacteristic).pipe(
      map((buffer: ArrayBuffer) => this.decodeDataPackage(buffer)),
      filter((step: Step | null): step is Step => step !== null)
    );
  }

  setTubeVoltageOn(device: DeviceOGKit) {
    const data = new Uint8Array([
      this.IN_PACKET_SET_VOLTAGE,
      ...this.tubesVoltageProfile[device.apparatusTubeType].setVoltageOnPayload
    ]);
    this.ble
      .write(device.sensorUUID, this.serviceUUID, this.sendCharacteristic, <ArrayBuffer>data.buffer)
      .then(console.log);
  }

  setTubeVoltageOff(device: DeviceOGKit) {
    const data = new Uint8Array([this.IN_PACKET_SET_VOLTAGE, 0x00, 0x00, 0x00, 0x00]);
    this.ble.write(device.sensorUUID, this.serviceUUID, this.sendCharacteristic, <ArrayBuffer>data.buffer);
  }

  private decodeStringArray(array: Uint8Array): string {
    return new TextDecoder('utf8').decode(array.slice(2, 2 + array[1]));
  }

  private decodeDataPackage(buffer: ArrayBuffer): Step | null {
    const dataView = new DataView(buffer);
    if (
      dataView.getUint8(this.OUT_PACKET_HIT_POSITION) === this.OUT_PACKET_HIT &&
      dataView.getUint8(this.OUT_PACKET_TEMPERATURE_POSITION) === this.OUT_PACKET_TEMPERATURE &&
      dataView.getUint8(this.OUT_PACKET_VOLTAGE_POSITION) === this.OUT_PACKET_VOLTAGE
    ) {
      return {
        ts: Date.now(),
        hitsNumber: dataView.getUint8(this.OUT_PACKET_HIT_POSITION + 1),
        temperature: dataView.getFloat32(this.OUT_PACKET_TEMPERATURE_POSITION + 1, true),
        voltage: dataView.getFloat32(this.OUT_PACKET_VOLTAGE_POSITION + 1, true)
      };
    } else {
      return null;
    }
  }
}
