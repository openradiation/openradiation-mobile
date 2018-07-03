import { Device } from './device';

export class StartDiscoverDevices {
  static readonly type = '[Devices] Start discover devices';
}

export class StopDiscoverDevices {
  static readonly type = '[Devices] Stop discover devices';
}

export class DevicesDiscovered {
  static readonly type = '[Devices] Devices discovered';
  constructor(public devices: Device[]) {}
}

export class ConnectDevice {
  static readonly type = '[Devices] Connect device';
  constructor(public device: Device) {}
}

export class DisconnectDevice {
  static readonly type = '[Devices] Disconnect device';
  constructor() {}
}

export class ConnectionLost {
  static readonly type = '[Devices] Connection lost';
}

export class UpdateDeviceInfo {
  static readonly type = '[Devices] Update device info';
  constructor(public device: Device) {}
}

export class EditDeviceParams {
  static readonly type = '[Devices] Edit device params';
  constructor(public device: Device) {}
}

export class SaveDeviceParams {
  static readonly type = '[Devices] Save device params';
  constructor() {}
}

export class UpdateDevice {
  static readonly type = '[Devices] Update device';
  constructor(public device: Device, public update: Partial<Device>) {}
}

export class WaitForBLEConnection {
  static readonly type = '[Devices] Wait for BLE connection';
}

export class BLEConnectionLost {
  static readonly type = '[Devices] BLE connection lost';
}
