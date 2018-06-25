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
  constructor(public device: Device) {}
}

export class ConnectionLost {
  static readonly type = '[Devices] Connection lost';
}
