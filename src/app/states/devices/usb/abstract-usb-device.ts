import { AbstractDevice } from '../abstract-device';

export abstract class AbstractUSBDevice extends AbstractDevice {
  abstract readonly pid: string;
  abstract readonly vid: string;
  readonly driver: string = 'CdcAcmSerialDriver';
  abstract readonly baudRate: number;
  abstract readonly dataBits: number;
}
