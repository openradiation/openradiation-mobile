import { Device } from './device';

export class AddDevice {
  static readonly type = '[Devices] Add device';
  constructor(public newDevice: Device) {}
}

export class ConnectDevice {
  static readonly type = '[Devices] Connect device';
  constructor(public device: Device) {}
}

export class DisconnectDevice {
  static readonly type = '[Devices] Disconnect device';
  constructor(public device: Device) {}
}
