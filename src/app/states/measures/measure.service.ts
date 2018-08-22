import { Injectable } from '@angular/core';
import { Measure } from './measure';
import { AbstractDevice, DeviceType } from '../devices/abstract-device';
import { DeviceOGKitService } from '../devices/device-og-kit.service';
import { DeviceAtomTagService } from '../devices/device-atom-tag.service';

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
