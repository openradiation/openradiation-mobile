import { AbstractDevice } from './abstract-device';
import { AbstractBLEDevice } from './ble/abstract-ble-device';
import { AbstractUSBDevice } from './usb/abstract-usb-device';

export class InitDevices {
  static readonly type = '[Devices] Init';
  constructor(public knownDevices: AbstractDevice[]) {}
}

export class StartDiscoverBLEDevices {
  static readonly type = '[Devices] Start discover BLE devices';
}

export class StartDiscoverUSBDevices {
  static readonly type = '[Devices] Start discover USB devices';
}

export class StopDiscoverDevices {
  static readonly type = '[Devices] Stop discover devices';
}

export class BLEDevicesDiscovered {
  static readonly type = '[Devices] BLE Devices discovered';
  constructor(public devices: AbstractBLEDevice[]) {}
}

export class USBDevicesDiscovered {
  static readonly type = '[Devices] USB Devices discovered';
  constructor(public devices: AbstractUSBDevice[]) {}
}

export class ConnectDevice {
  static readonly type = '[Devices] Connect device';
  constructor(public device: AbstractDevice) {}
}

export class DisconnectDevice {
  static readonly type = '[Devices] Disconnect device';
}

export class DeviceConnectionLost {
  static readonly type = '[Devices] Device connection lost';
}

export class UpdateDeviceInfo {
  static readonly type = '[Devices] Update device info';
  constructor(public device: AbstractDevice) {}
}

export class EditDeviceParams {
  static readonly type = '[Devices] Edit device params';
  constructor(public device: AbstractDevice) {}
}

export class SaveDeviceParams {
  static readonly type = '[Devices] Save device params';
}

export class UpdateDevice {
  static readonly type = '[Devices] Update device';
  constructor(public device: AbstractDevice) {}
}

export class BLEConnectionLost {
  static readonly type = '[Devices] BLE connection lost';
}
