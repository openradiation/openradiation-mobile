import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { forkJoin, interval, Observable, of } from 'rxjs';
import { filter, shareReplay, take, takeUntil, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AbstractDevice, ApparatusSensorType } from '../devices/abstract-device';
import { DeviceConnectionLost } from '../devices/devices.action';
import { DevicesService } from '../devices/devices.service';
import { UserStateModel } from '../user/user.state';
import { Measure, MeasureSeries, MeasureType, PositionAccuracyThreshold, Step } from './measure';
import { MeasureApi } from './measure-api';
import { AddMeasureScanStep, CancelMeasure, StopMeasureScan, UpdateMeasureScanTime } from './measures.action';
import { PositionService } from './position.service';
import { addUndefinedDefaults } from '@angular-devkit/core/src/json/schema/transforms';

@Injectable({
  providedIn: 'root'
})
export class MeasuresService {
  constructor(
    private store: Store,
    private actions$: Actions,
    private httpClient: HttpClient,
    private devicesService: DevicesService,
    private positionService: PositionService
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
          .pipe(
            takeUntil(stopSignal),
            filter(() => !this.positionService.isAcquiringPosition)
          )
          .subscribe(() => this.store.dispatch(new UpdateMeasureScanTime(device)).subscribe())
      )
    );
  }

  private detectHits(device: AbstractDevice, stopSignal: Observable<any>): Observable<Step> {
    const detectHits = this.devicesService
      .service(device)
      .startMeasureScan(device, stopSignal)
      .pipe(
        takeUntil(stopSignal),
        filter(() => !this.positionService.isAcquiringPosition),
        shareReplay()
      );
    detectHits.subscribe(step => this.store.dispatch(new AddMeasureScanStep(step, device)).subscribe());
    return detectHits;
  }

  computeRadiationValue(measure: Measure, device: AbstractDevice): number {
    return this.devicesService.service(device).computeRadiationValue(measure);
  }

  publishMeasure(measure: Measure | MeasureSeries): Observable<any> {
    switch (measure.type) {
      case MeasureType.Measure: {
        return this.postMeasure(measure);
      }
      case MeasureType.MeasureSeries: {
        return forkJoin(measure.measures.map(subMeasure => this.postMeasure(subMeasure)));
      }
    }
  }

  private postMeasure(measure: Measure): Observable<any> {
    if (
      measure.accuracy &&
      measure.accuracy < PositionAccuracyThreshold.No &&
      measure.endAccuracy &&
      measure.endAccuracy < PositionAccuracyThreshold.No
    ) {
      const payload: MeasureApi = {
        apiKey: environment.API_KEY,
        data: {
          apparatusId: measure.apparatusId,
          apparatusVersion: measure.apparatusVersion,
          apparatusSensorType: this.formatApparatusSensorType(measure.apparatusSensorType),
          apparatusTubeType: measure.apparatusTubeType,
          temperature: measure.temperature ? Math.round(measure.temperature) : undefined,
          value: measure.value,
          hitsNumber: measure.hitsNumber,
          startTime: new Date(measure.startTime).toISOString(),
          endTime: measure.endTime ? new Date(measure.endTime).toISOString() : undefined,
          latitude: measure.latitude!,
          longitude: measure.longitude!,
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
    } else {
      return of(null);
    }
  }

  private formatApparatusSensorType(apparatusSensorType?: string): ApparatusSensorType | undefined {
    if (apparatusSensorType !== undefined) {
      if (apparatusSensorType.includes(ApparatusSensorType.Geiger)) {
        return ApparatusSensorType.Geiger;
      } else if (apparatusSensorType.includes(ApparatusSensorType.Photodiode)) {
        return ApparatusSensorType.Photodiode;
      }
    }
    return undefined;
  }
}
