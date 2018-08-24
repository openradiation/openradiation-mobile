import { Injectable } from '@angular/core';
import { AbstractDevice, DeviceType } from '../devices/abstract-device';
import { DeviceAtomTagService } from '../devices/device-atom-tag.service';
import { DeviceOGKitService } from '../devices/device-og-kit.service';
import { Measure, Step } from './measure';
import { Observable } from 'rxjs';
import { DeviceOGKit } from '../devices/device-og-kit';
import { DeviceAtomTag } from '../devices/device-atom-tag';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { shareReplay, take, takeUntil } from 'rxjs/operators';
import { StopMeasureScan, UpdateMeasure } from './measures.action';

@Injectable({
  providedIn: 'root'
})
export class MeasuresService {
  constructor(
    private deviceOGKitService: DeviceOGKitService,
    private deviceAtomTagService: DeviceAtomTagService,
    private store: Store,
    private actions$: Actions
  ) {}

  startMeasureScan(device: AbstractDevice): Observable<any> {
    let startMeasureScan: Observable<Step>;
    const stopSignal = this.actions$.pipe(ofActionSuccessful(StopMeasureScan));
    switch (device.deviceType) {
      case DeviceType.OGKit:
        startMeasureScan = this.deviceOGKitService.startMeasureScan(<DeviceOGKit>device, stopSignal);
        break;
      case DeviceType.AtomTag:
        startMeasureScan = this.deviceAtomTagService.startMeasureScan(<DeviceAtomTag>device, stopSignal);
        break;
    }
    startMeasureScan = startMeasureScan!.pipe(
      takeUntil(stopSignal),
      shareReplay()
    );
    startMeasureScan.subscribe(step => this.store.dispatch(new UpdateMeasure(step, device)));
    return startMeasureScan.pipe(take(1));
  }
  computeRadiationValue(measure: Measure, device: AbstractDevice): number {
    switch (device.deviceType) {
      case DeviceType.OGKit:
        return this.deviceOGKitService.computeRadiationValue(measure);
      case DeviceType.AtomTag:
        return this.deviceAtomTagService.computeRadiationValue(measure);
    }
  }
}
