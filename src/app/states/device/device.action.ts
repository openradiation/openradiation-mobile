import { Device } from './device';

export class AddDevice {
  static readonly type = '[Devices] Add device';
  constructor(public newDevice: Device) {}
}
