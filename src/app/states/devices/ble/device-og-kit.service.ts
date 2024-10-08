import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, from } from 'rxjs';
import { filter, map, scan, shareReplay, take, tap } from 'rxjs/operators';
import { Step } from '@app/states/measures/measure';
import { ApparatusSensorType } from '@app/states/devices/abstract-device';
import { RawBLEDevice } from './abstract-ble-device';
import { AbstractBLEDeviceService } from './abstract-ble-device.service';
import { DeviceOGKit, DeviceOgKitType } from './device-og-kit';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { numberToUUID } from '@capacitor-community/bluetooth-le';

@Injectable({
  providedIn: 'root'
})
export class DeviceOGKitService extends AbstractBLEDeviceService<DeviceOGKit> {
  protected calibrationFunctions = {
    planeMode: {
      0: '0.000001 * (cps - 0.14) ^ 3 + 0.0025 * (cps - 0.14) ^ 2 + 0.39 * (cps - 0.14)',
      1.83: 'cps * 0.96'
    },
    groundLevel: {
      0: '0.000001 * (cps - 0.14) ^ 3 + 0.0025 * (cps - 0.14) ^ 2 + 0.39 * (cps - 0.14)'
    }
  };

  //RF-Duino config
  protected service = numberToUUID(0x2220);
  protected receiveCharacteristic = numberToUUID(0x2221);
  private sendCharacteristic = numberToUUID(0x2222);

  private SEND_GET_INFO = 0x12;
  private RECEIVE_SENSOR_TYPE = 3;
  private RECEIVE_TUBE_TYPE = 16;

  private SEND_SET_VISUAL_HIT = 0x01;
  private SEND_SET_AUDIO_HIT = 0x02;

  private SEND_SET_VOLTAGE = 0x11;
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

  private RECEIVE_HIT = 5;
  private RECEIVE_HIT_POSITION = 0;
  private RECEIVE_TEMPERATURE = 6;
  private RECEIVE_TEMPERATURE_POSITION = 2;
  private RECEIVE_VOLTAGE = 18;
  private RECEIVE_VOLTAGE_POSITION = 9;

  constructor(protected store: Store) {
    super(store);
  }

  getDeviceInfo(device: DeviceOGKit): Observable<Partial<DeviceOGKit>> {
    const startReceiveData = this.startReceiveData(device).pipe(shareReplay());
    startReceiveData.subscribe();
    this.sendData(device, [this.SEND_GET_INFO]);
    return startReceiveData.pipe(
      scan((update: Partial<DeviceOGKit>, dataView: DataView) => {
        const array = new Uint8Array(dataView.buffer);
        switch (array[0]) {
          case this.RECEIVE_SENSOR_TYPE:
            update.apparatusSensorType = this.decodeStringArray(array).toLowerCase() as ApparatusSensorType;
            break;
          case this.RECEIVE_TUBE_TYPE:
            update.apparatusTubeType = this.decodeStringArray(array);
            break;
        }
        return update;
      }, {}),
      filter(update => update.apparatusSensorType !== undefined && update.apparatusTubeType !== undefined),
      take(1),
      tap(() => this.stopReceiveData(device)),
      tap(update => setTimeout(() => this.setTubeVoltageOn({ ...device, ...update }), 200))
    );
  }

  saveDeviceParams(device: DeviceOGKit): Observable<unknown> {
    return from(
      this.sendData(device, [this.SEND_SET_VISUAL_HIT, device.params.visualHits ? 0x00 : 0x01]).then(() =>
        this.sendData(device, [this.SEND_SET_AUDIO_HIT, device.params.audioHits ? 0x00 : 0x01])
      )
    );
  }

  startMeasureScan(device: DeviceOGKit, stopSignal: Observable<unknown>): Observable<Step> {
    this.setTubeVoltageOn(device);
    stopSignal.subscribe(() => this.stopReceiveData(device));
    return this.startReceiveData(device).pipe(
      map((dataView: DataView) => this.decodeDataPackage(dataView)),
      filter((step: Step | null): step is Step => step !== null),
      filter(
        (step: Step) =>
          !device.apparatusTubeType || step.voltage! > this.tubesVoltageProfile[device.apparatusTubeType].min
      )
    );
  }

  private setTubeVoltageOn(device: DeviceOGKit) {
    if (device.apparatusTubeType) {
      this.sendData(device, [
        this.SEND_SET_VOLTAGE,
        ...this.tubesVoltageProfile[device.apparatusTubeType].setVoltageOnPayload
      ]);
    }
  }

  private async sendData(device: DeviceOGKit, data: number[]): Promise<unknown> {
    try {
      const result = await BleClient.write(device.sensorUUID, this.service, this.sendCharacteristic,
        new DataView(new Uint8Array(data).buffer)
      );
      return result;
    } catch (error) {
      const logInfos = "UUID : " + device.sensorUUID + " / Service: " + this.service + " /Characteristic: " + this.sendCharacteristic + " /data : " + data.toString();
      this.logAndStore("Error while sending data with OgKit " + logInfos, error)
      return Promise.reject(error);
    }
  }

  private decodeStringArray(array: Uint8Array): string {
    return this.textDecoder.decode(array.slice(2, 2 + array[1]));
  }

  protected decodeDataPackage(dataView: DataView): Step | null {
    if (
      dataView.getUint8(this.RECEIVE_HIT_POSITION) === this.RECEIVE_HIT &&
      dataView.getUint8(this.RECEIVE_TEMPERATURE_POSITION) === this.RECEIVE_TEMPERATURE &&
      dataView.getUint8(this.RECEIVE_VOLTAGE_POSITION) === this.RECEIVE_VOLTAGE
    ) {
      const receiveData = {
        ts: Date.now(),
        hitsNumber: dataView.getUint8(this.RECEIVE_HIT_POSITION + 1),
        temperature: dataView.getFloat32(this.RECEIVE_TEMPERATURE_POSITION + 1, true),
        voltage: dataView.getFloat32(this.RECEIVE_VOLTAGE_POSITION + 1, true)
      };
      this.logAndStore("Received from OgKit : " + JSON.stringify(receiveData))
      return receiveData;
    } else {
      return null;
    }
  }

  buildDevice(rawBLEDevice: RawBLEDevice): DeviceOGKit | null {
    if (
      rawBLEDevice.name.toUpperCase().startsWith(DeviceOgKitType.OG) ||
      rawBLEDevice.name.toUpperCase().includes(DeviceOgKitType.OPENG)
    ) {
      return new DeviceOGKit(rawBLEDevice);
    }
    return null;
  }
}
