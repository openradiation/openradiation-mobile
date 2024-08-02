import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Measure, Step } from '../measures/measure';
import { AbstractDevice, CalibrationFunctions, RawDevice } from './abstract-device';

export abstract class AbstractDeviceService<T extends AbstractDevice> {
  protected textDecoder = new TextDecoder('utf8');

  protected abstract calibrationFunctions: {
    planeMode: CalibrationFunctions;
    groundLevel: CalibrationFunctions;
  };

  protected constructor(protected store: Store) { }

  abstract buildDevice(rawDevice?: RawDevice): T | null;

  abstract getDeviceInfo(device: T): Observable<Partial<T>>;

  abstract saveDeviceParams(device: T): Observable<unknown>;

  abstract startMeasureScan(device: T, stopSignal: Observable<unknown>): Observable<Step>;

  computeRadiationValue(measure: Measure, planeMode: boolean): [number, string] {
    if (measure.endTime && measure.hitsNumber !== undefined) {
      const duration = (measure.endTime - measure.startTime) / 1000;
      const hitsNumberPerSec = measure.hitsNumber / duration;
      return this.convertHitsNumberPerSec(hitsNumberPerSec, planeMode);
    } else {
      throw new Error('Incorrect measure : missing endTime or hitsNumber');
    }
  }

  // Return an array with value and used calibration function (string)
  protected convertHitsNumberPerSec(hitsNumberPerSec: number, planeMode: boolean): [number, string] {
    const calibrationFunction = this.getCalibrationFunction(
      hitsNumberPerSec,
      planeMode ? this.calibrationFunctions.planeMode : this.calibrationFunctions.groundLevel
    );
    if (calibrationFunction) {
      // See https://esbuild.github.io/content-types/#direct-eval
      const indirectEval = eval
      return [
        indirectEval(
          calibrationFunction
            .replace(/cps/g, 'hitsNumberPerSec')
            .replace(/\^/g, '**')
            .replace(/max/g, 'Math.max')
        ),
        calibrationFunction
      ];
    } else {
      return [0, ''];
    }
  }

  protected getCalibrationFunction(hitsNumberPerSec: number, calibrationFunctions: CalibrationFunctions): string {
    const thresholds = Object.keys(calibrationFunctions)
      .sort()
      .reverse();
    let determinedCalibrationFunctions = 0;
    for (const threshold of thresholds) {
      const parsedThreshold = Number(threshold);
      if (hitsNumberPerSec >= parsedThreshold) {
        determinedCalibrationFunctions = parsedThreshold;
        break;
      }
    }
    return calibrationFunctions[determinedCalibrationFunctions];
  }

  abstract connectDevice(device: T): Observable<unknown>;

  abstract disconnectDevice(device: T): Observable<unknown>;

  protected abstract decodeDataPackage(buffer: ArrayBuffer | ArrayBuffer[]): Step | null;

  protected arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(n => n.toString(16).padStart(2, '0'))
      .join('');
  }
}
