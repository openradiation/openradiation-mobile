import { Device } from './device';

export class DiscoverDevices {
  static readonly type = '[Devices] Discover devices';
  constructor() {}
}

export class ConnectDevice {
  static readonly type = '[Devices] Connect device';
  constructor(public device: Device) {}
}

export class DisconnectDevice {
  static readonly type = '[Devices] Disconnect device';
  constructor(public device: Device) {}
}
