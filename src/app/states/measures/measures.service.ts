import { Injectable } from '@angular/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { shareReplay, take, takeUntil } from 'rxjs/operators';
import { AbstractDevice, DeviceType } from '../devices/abstract-device';
import { DeviceAtomTag } from '../devices/device-atom-tag';
import { DeviceAtomTagService } from '../devices/device-atom-tag.service';
import { DeviceOGKit } from '../devices/device-og-kit';
import { DeviceOGKitService } from '../devices/device-og-kit.service';
import { Measure, Step } from './measure';
import { StopMeasureScan, UpdateMeasure } from './measures.action';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MeasureApi } from './measure-api';
import { UserStateModel } from '../user/user.state';

@Injectable({
  providedIn: 'root'
})
export class MeasuresService {
  constructor(
    private deviceOGKitService: DeviceOGKitService,
    private deviceAtomTagService: DeviceAtomTagService,
    private store: Store,
    private actions$: Actions,
    private httpClient: HttpClient
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

  publishMeasure(measure: Measure): Observable<any> {
    const payload: MeasureApi = {
      apiKey: environment.API_KEY,
      data: {
        apparatusId: measure.apparatusId,
        apparatusVersion: measure.apparatusVersion,
        apparatusSensorType: measure.apparatusSensorType,
        apparatusTubeType: measure.apparatusTubeType,
        temperature: measure.temperature,
        value: measure.value,
        hitsNumber: measure.hitsNumber,
        startTime: new Date(measure.startTime).toISOString(),
        endTime: measure.endTime ? new Date(measure.endTime).toISOString() : undefined,
        latitude: measure.latitude,
        longitude: measure.longitude,
        accuracy: measure.accuracy,
        altitude: measure.altitude,
        altitudeAccuracy: measure.altitudeAccuracy,
        endLatitude: measure.endLatitude,
        endLongitude: measure.endLongitude,
        endAccuracy: measure.endAccuracy,
        endAltitude: measure.endAltitude,
        endAltitudeAccuracy: measure.endAltitudeAccuracy,
        deviceUuid: measure.deviceUuid,
        devicePlatform: measure.devicePlatform,
        deviceVersion: measure.deviceVersion,
        deviceModel: measure.deviceModel,
        reportUuid: measure.reportUuid,
        manualReporting: measure.manualReporting,
        organisationReporting: measure.organisationReporting,
        reportContext: 'test',
        description: measure.description,
        measurementHeight: measure.measurementHeight,
        tags: measure.tags,
        enclosedObject: measure.enclosedObject,
        userId: this.store.selectSnapshot(({ user }: { user: UserStateModel }) => user.login),
        userPwd: this.store.selectSnapshot(({ user }: { user: UserStateModel }) => user.password),
        measurementEnvironment: measure.measurementEnvironment,
        rain: measure.rain
      }
    };
    return this.httpClient.post(environment.API_URI, payload);
  }
}
