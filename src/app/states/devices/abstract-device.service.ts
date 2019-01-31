import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Measure, Step } from '../measures/measure';
import { AbstractDevice, RawDevice } from './abstract-device';

export abstract class AbstractDeviceService<T extends AbstractDevice> {
  protected textDecoder = new TextDecoder('utf8');

  constructor(protected store: Store) {}

  abstract buildDevice(rawDevice?: RawDevice): T | null;

  abstract getDeviceInfo(device: T): Observable<Partial<T>>;

  abstract saveDeviceParams(device: T): Observable<any>;

  abstract startMeasureScan(device: T, stopSignal: Observable<any>): Observable<Step>;

  computeRadiationValue(measure: Measure): number {
    if (measure.endTime && measure.hitsNumber !== undefined) {
      const duration = (measure.endTime - measure.startTime) / 1000;
      const hitsNumberPerSec = measure.hitsNumber / duration;
      return this.convertHitsNumberPerSec(hitsNumberPerSec);
    } else {
      throw new Error('Incorrect measure : missing endTime or hitsNumber');
    }
  }

  protected abstract convertHitsNumberPerSec(hitsNumberPerSec: number): number;

  abstract connectDevice(device: T): Observable<any>;

  abstract disconnectDevice(device: T): Observable<any>;

  protected abstract decodeDataPackage(buffer: ArrayBuffer | ArrayBuffer[]): Step | null;
}
