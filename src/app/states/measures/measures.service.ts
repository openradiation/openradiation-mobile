import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { interval, Observable } from 'rxjs';
import { shareReplay, take, takeUntil, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AbstractDevice, DeviceType } from '../devices/abstract-device';
import { DeviceAtomTag } from '../devices/device-atom-tag';
import { DeviceAtomTagService } from '../devices/device-atom-tag.service';
import { DeviceOGKit } from '../devices/device-og-kit';
import { DeviceOGKitService } from '../devices/device-og-kit.service';
import { UserStateModel } from '../user/user.state';
import { Measure, Step } from './measure';
import { ApparatusSensorType, MeasureApi } from './measure-api';
import { AddMeasureScanStep, CancelMeasure, StopMeasureScan, UpdateMeasureScanTime } from './measures.action';
import { DeviceConnectionLost } from '../devices/devices.action';

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
    const stopSignal = this.actions$.pipe(
      ofActionSuccessful(StopMeasureScan, CancelMeasure),
      take(1)
    );
    this.actions$
      .pipe(
        ofActionSuccessful(DeviceConnectionLost),
        take(1)
      )
      .subscribe(() => this.store.dispatch(new CancelMeasure()));
    return this.detectHits(device, stopSignal).pipe(
      take(1),
      tap(() =>
        interval(1000)
          .pipe(takeUntil(stopSignal))
          .subscribe(() => this.store.dispatch(new UpdateMeasureScanTime(device)))
      )
    );
  }

  private detectHits(device: AbstractDevice, stopSignal: Observable<any>): Observable<Step> {
    let detectHits: Observable<Step>;
    switch (device.deviceType) {
      case DeviceType.OGKit:
        detectHits = this.deviceOGKitService.startMeasureScan(<DeviceOGKit>device, stopSignal);
        break;
      case DeviceType.AtomTag:
        detectHits = this.deviceAtomTagService.startMeasureScan(<DeviceAtomTag>device, stopSignal);
        break;
    }
    detectHits = detectHits!.pipe(
      takeUntil(stopSignal),
      shareReplay()
    );
    detectHits.subscribe(step => this.store.dispatch(new AddMeasureScanStep(step, device)));
    return detectHits;
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
    let apparatusSensorType: ApparatusSensorType | undefined;
    if (measure.apparatusSensorType) {
      if (measure.apparatusSensorType.toLowerCase().includes(ApparatusSensorType.Geiger)) {
        apparatusSensorType = ApparatusSensorType.Geiger;
      } else if (measure.apparatusSensorType.toLowerCase().includes(ApparatusSensorType.Photodiode)) {
        apparatusSensorType = ApparatusSensorType.Photodiode;
      }
    }
    const payload: MeasureApi = {
      apiKey: environment.API_KEY,
      data: {
        apparatusId: measure.apparatusId,
        apparatusVersion: measure.apparatusVersion,
        apparatusSensorType: apparatusSensorType,
        apparatusTubeType: measure.apparatusTubeType,
        temperature: measure.temperature ? Math.round(measure.temperature) : undefined,
        value: measure.value,
        hitsNumber: measure.hitsNumber,
        startTime: new Date(measure.startTime).toISOString(),
        endTime: measure.endTime ? new Date(measure.endTime).toISOString() : undefined,
        latitude: measure.latitude,
        longitude: measure.longitude,
        accuracy: measure.accuracy,
        altitude: measure.altitude ? Math.round(measure.altitude) : undefined,
        altitudeAccuracy: measure.altitudeAccuracy,
        endLatitude: measure.endLatitude,
        endLongitude: measure.endLongitude,
        endAccuracy: measure.endAccuracy,
        endAltitude: measure.endAltitude ? Math.round(measure.endAltitude) : undefined,
        endAltitudeAccuracy: measure.endAltitudeAccuracy,
        deviceUuid: measure.deviceUuid,
        devicePlatform: measure.devicePlatform,
        deviceVersion: measure.deviceVersion,
        deviceModel: measure.deviceModel,
        reportUuid: measure.reportUuid,
        manualReporting: measure.manualReporting,
        organisationReporting: measure.organisationReporting,
        reportContext: 'routine',
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
