import { Injectable } from '@angular/core';
import { AbstractDevice, DeviceType } from '../devices/abstract-device';
import { DeviceAtomTagService } from '../devices/device-atom-tag.service';
import { DeviceOGKitService } from '../devices/device-og-kit.service';
import { Measure } from './measure';

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
}
