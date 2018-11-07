import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { catchError, concatMap, shareReplay, take } from 'rxjs/operators';
import { Measure, Step } from '../measures/measure';
import { AbstractDevice } from './abstract-device';
import { DeviceConnectionLost } from './devices.action';

export abstract class AbstractDeviceService<T extends AbstractDevice> {
  protected textDecoder = new TextDecoder('utf8');

  constructor(protected store: Store) {}

  abstract getDeviceInfo(device: T): Observable<Partial<T>>;

  abstract saveDeviceParams(device: T): Observable<any>;

  abstract startMeasureScan(device: T, stopSignal: Observable<any>): Observable<Step>;

  abstract computeRadiationValue(measure: Measure): number;

  connectDevice(device: T): Observable<any> {
    const connection = this.getDeviceConnection(device).pipe(
      concatMap(() => this.saveDeviceParams(device)),
      shareReplay()
    );
    connection.pipe(catchError(() => this.store.dispatch(new DeviceConnectionLost()))).subscribe();
    return connection.pipe(take(1));
  }

  protected abstract getDeviceConnection(device: T): Observable<any>;

  abstract disconnectDevice(device: T): Observable<any>;

  protected abstract decodeDataPackage(buffer: ArrayBuffer | ArrayBuffer[]): Step | null;
}
