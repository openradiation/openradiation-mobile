# Add support for a new sensor

Every part will have an example with a new "Toto" sensor.

## Sensor type
File => ``src/app/states/devices/abstract-device.ts``

Each sensor need to have a corresponding enum, which string value needs to be unique.
It is used to identify the sensor type when passing a sensor object to any service in the application.

For BLE sensors, the value **needs** to be a sub-string of the name advertised by the device.

### example
```typescript
export enum DeviceType {
  Mock = 'Mock',
  OGKit = 'OG-KIT1',
  AtomTag = 'AtomTag',
  SafeCast = 'bGeigieBLE',
  PocketGeiger = 'Pocket Geiger Type 6',
  Toto = 'toto'
}
```

## Sensor class
File => ``src/app/states/devices/<connection-type>/device-<sensor-type>.ts``

This class will represent this sensor type and all its parameters and characteristics.

They can either be statically set (all sensors of this type all will have the same values) or dynamically computed (the constructor receives the advertising BLE datas).

Some inherited values from base class like ``hitsAccuracyThreshold`` can also be overridden in the sensor class.

### example
For a BLE sensor the file would be ``src/app/states/devices/ble/device-toto.ts``
```typescript
import { ApparatusSensorType, DeviceType } from '../abstract-device';
import { AbstractBLEDevice, RawBLEDevice } from './abstract-ble-device';

export class DeviceToto extends AbstractBLEDevice {
  readonly deviceType = DeviceType.Toto;
  apparatusVersion: string = DeviceType.Toto;
  apparatusSensorType = ApparatusSensorType.Geiger;
  apparatusTubeType = 'TotoTube';
  hitsPeriod = 1000;

  constructor(rawDevice: RawBLEDevice) {
    super(rawDevice);
    this.apparatusVersion = rawDevice.name;
    this.apparatusId = rawDevice.id;
  }
}
```

## Sensor instantiation

After creating the sensor class, you need to tell where and when it should be instantiated.

### BLE device
File => ``src/app/states/ble/ble-devices.service.ts``

You need to edit the file around line 104 like this:
```typescript
if (rawDevice.name.includes(DeviceType.OGKit)) {
  return new DeviceOGKit(rawDevice);
} else if (rawDevice.name.includes(DeviceType.AtomTag)) {
  return new DeviceAtomTag(rawDevice);
} else if (rawDevice.name.includes(DeviceType.SafeCast)) {
  return new DeviceSafeCast(rawDevice);
} else if (rawDevice.name.includes(DeviceType.Toto)) {
  return new DeviceToto(rawDevice);
}
```

### USB device
File => ``src/app/states/usb/usb-devices.service.ts``

You need to edit the file around line 42 like this:
```typescript
const usbDevices: AbstractUSBDevice[] = [new DevicePocketGeiger(), new DeviceToto()];
```

## Sensor service
File => ``src/app/states/devices/<connection-type>/device-<sensor-type>.service.ts``

The sensor need a service to handle the communication between the application and the physical device.

Once you've implemented this service, you need to attach it to the global devices service so it can be used automatically throughout the application.

### Example
For a BLE sensor the file would be ``src/app/states/devices/ble/device-toto.service.ts``
```typescript
import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { bufferCount, filter, map, tap } from 'rxjs/operators';
import { Step } from '../../measures/measure';
import { AbstractBLEDeviceService } from './abstract-ble-device.service';
import { DeviceSafeCast } from './device-safe-cast';

@Injectable({
  providedIn: 'root'
})
export class DeviceTotoService extends AbstractBLEDeviceService<DeviceToto> {
  protected service = 'ef080d8c-c3be-41ff-bd3f-05a5f4795d7f';
  protected receiveCharacteristic = 'a1e8f5b1-696b-4e4c-87c6-69dfe0b0093b';

  constructor(protected store: Store, protected ble: BLE) {
    super(store, ble);
  }

  protected convertHitsNumberPerSec(hitsNumberPerSec: number): number {
    return (hitsNumberPerSec * 60) / 334;
  }

  getDeviceInfo(device: DeviceToto): Observable<Partial<DeviceToto>> {
    return of({});
  }

  saveDeviceParams(device: DeviceToto): Observable<any> {
    return of(null);
  }

  startMeasureScan(device: DeviceToto, stopSignal: Observable<any>): Observable<Step> {
    stopSignal.subscribe(() => this.stopReceiveData(device));
    let readingBufferSequence = false;
    return this.startReceiveData(device).pipe(
      filter((buffer: ArrayBuffer) => {
        const dataView = new DataView(buffer);
        return dataView.getUint8(0) === 36 || readingBufferSequence;
      }),
      tap(() => (readingBufferSequence = true)),
      bufferCount(18),
      tap(() => (readingBufferSequence = false)),
      map(buffers => this.decodeDataPackage(buffers))
    );
  }

  protected decodeDataPackage(buffers: ArrayBuffer[]): Step {
    const data = buffers
      .map(buffer => this.textDecoder.decode(buffer))
      .join('')
      .split(',');
    return {
      ts: Date.now(),
      hitsNumber: Number(data[4])
    };
  }
}
```

Around line 20 in ``src/app/states/devices/devices.services.ts``
```typescript
constructor(
    private actions$: Actions,
    private toastController: ToastController,
    private translateService: TranslateService,
    private deviceMockService: DeviceMockService,
    private deviceOGKitService: DeviceOGKitService,
    private deviceAtomTagService: DeviceAtomTagService,
    private deviceSafeCastService: DeviceSafeCastService,
    private devicePocketGeigerService: DevicePocketGeigerService,
    private deviceTotoService: DeviceTotoService
  ) {
    this.services = {
      [DeviceType.Mock]: this.deviceMockService,
      [DeviceType.OGKit]: this.deviceOGKitService,
      [DeviceType.AtomTag]: this.deviceAtomTagService,
      [DeviceType.SafeCast]: this.deviceSafeCastService,
      [DeviceType.PocketGeiger]: this.devicePocketGeigerService,
      [DeviceType.Toto]: this.deviceTotoService
    };
    /** irrelevant stuff **/
  }
```