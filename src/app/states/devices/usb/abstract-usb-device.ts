import { AbstractDevice } from '../abstract-device';

export abstract class AbstractUSBDevice extends AbstractDevice {
  abstract readonly pid: string;
  abstract readonly vid: string;
  abstract readonly driver: string;
}
