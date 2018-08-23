import { Injectable } from '@angular/core';
import { AbstractDevice, DeviceType } from '../devices/abstract-device';
import { DeviceAtomTagService } from '../devices/device-atom-tag.service';
import { DeviceOGKitService } from '../devices/device-og-kit.service';
import { Measure } from './measure';
import { Observable } from 'rxjs';
import { DeviceOGKit } from '../devices/device-og-kit';
import { DeviceAtomTag } from '../devices/device-atom-tag';

@Injectable({
  providedIn: 'root'
})
export class MeasuresService {
  constructor(private deviceOGKitService: DeviceOGKitService, private deviceAtomTagService: DeviceAtomTagService) {}

  computeRadiationValue(measure: Measure, device: AbstractDevice): number {
    switch (device.deviceType) {
      case DeviceType.OGKit:
        return this.deviceOGKitService.computeRadiationValue(measure);
      case DeviceType.AtomTag:
        return this.deviceAtomTagService.computeRadiationValue(measure);
    }
  }

  startMeasureScan(device: AbstractDevice): Observable<any> {
    switch (device.deviceType) {
      case DeviceType.OGKit:
        return this.deviceOGKitService.startMeasureScan(<DeviceOGKit>device);
      case DeviceType.AtomTag:
        return this.deviceAtomTagService.startMeasureScan(<DeviceAtomTag>device);
    }
  }
}
