import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { forkJoin, Observable, of, concatMap, timer, map } from 'rxjs';
import { catchError, shareReplay, take, takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AbstractDevice, ApparatusSensorType } from '@app/states/devices/abstract-device';
import { DeviceConnectionLost } from '@app/states/devices/devices.action';
import { DevicesService } from '@app/states/devices/devices.service';
import { UserStateModel } from '@app/states/user/user.state';
import { Measure, MeasureEnvironment, MeasureSeries, MeasureSeriesParams, MeasureSeriesParamsSelected, MeasureType, PositionAccuracyThreshold, Step } from '@app/states/measures/measure';
import { MeasureApi } from '@app/states/measures/measure-api';
import { AddMeasureScanStep, CancelMeasure, PublishMeasureProgress, StopMeasureScan } from '@app/states/measures/measures.action';
import { MeasuresStateModel } from '@app/states/measures/measures.state';
import { DevicesState } from '../devices/devices.state';

@Injectable({
  providedIn: 'root'
})
export class MeasuresService {
  constructor(
    private store: Store,
    private actions$: Actions,
    private httpClient: HttpClient,
    private devicesService: DevicesService
  ) { }

  startMeasureScan(device: AbstractDevice): Observable<unknown> {
    const stopSignal = this.actions$.pipe(
      ofActionSuccessful(StopMeasureScan, CancelMeasure),
      take(1)
    );
    this.actions$
      .pipe(
        ofActionSuccessful(DeviceConnectionLost),
        take(1)
      )
      .subscribe(() => {
        const canEndCurrentScan = this.store.selectSnapshot(
          ({ measures }: { measures: MeasuresStateModel }) => measures.canEndCurrentScan
        );
        const deviceInDisconnectedMode = this.store.selectSnapshot(DevicesState.deviceInDisconnectedMeasureMode)
        if (canEndCurrentScan || deviceInDisconnectedMode) {
          this.store.dispatch(new StopMeasureScan(device, false));
        } else {
          this.store.dispatch(new CancelMeasure());
        }
      });
    return this.detectHits(device, stopSignal).pipe(take(1));
  }

  private detectHits(device: AbstractDevice, stopSignal: Observable<unknown>): Observable<Step> {
    const detectHits = this.devicesService
      .service(device)
      .startMeasureScan(device, stopSignal)
      .pipe(
        takeUntil(stopSignal),
        shareReplay()
      );
    detectHits.subscribe(step => this.store.dispatch(new AddMeasureScanStep(step, device)).subscribe());
    return detectHits;
  }

  computeRadiationValue(measure: Measure, device: AbstractDevice, planeMode: boolean): [number, string] {
    return this.devicesService.service(device).computeRadiationValue(measure, planeMode);
  }

  publishMeasure(measure: Measure | MeasureSeries): Observable<unknown> {
    switch (measure.type) {
      case MeasureType.Measure: {
        return this.postMeasure(measure).pipe(
          map(() => {
            measure.sent = true;
            return measure;
          }),
          catchError(() => {
            measure.sent = false;
            return of(measure);
          })
        );
      }
      case MeasureType.MeasureSeries: {
        let postDelay = 0;
        return forkJoin(
          measure.measures.map(subMeasure => {
            if (!subMeasure.sent) {
              // delay of 50ms between each call to avoid overflowing the server
              return timer(postDelay++ * 100).pipe(
                concatMap(() =>
                  this.postMeasure(subMeasure).pipe(
                    map(() => {
                      subMeasure.sent = true;
                      this.store.dispatch(new PublishMeasureProgress(subMeasure));
                      return subMeasure;
                    }),
                    catchError((httpError: HttpErrorResponse) => {
                      // Duplicate UUID error : measure was already sent on server (by a previous version)
                      if (httpError.status == 400 && ("" + httpError.error?.error?.message).indexOf("duplicate key") > -1) {
                        // Marking it as sent
                        subMeasure.sent = true;
                      } else {
                        subMeasure.sent = false;
                      }
                      this.store.dispatch(new PublishMeasureProgress(subMeasure));
                      return of(subMeasure);
                    })
                  )
                )
              );
            } else {
              this.store.dispatch(new PublishMeasureProgress(subMeasure));
              return of(subMeasure)
            }
          })
        ).pipe(
          map(() => {
            measure.sent = measure.measures.filter(s => !s.sent).length === 0;
            return measure
          })
        )
      }
    }
  }

  private postMeasure(measure: Measure): Observable<unknown> {
    if (this.canPublishMeasure(measure)) {
      // In case of an imprecise plane mesure : modify location & accuracy before sending if required
      this.handlePoorAccuracyInPlaneMode(measure);

      const payload: MeasureApi = {
        apiKey: environment.API_KEY,
        data: {
          apparatusId: measure.apparatusId,
          apparatusVersion: measure.apparatusVersion,
          apparatusSensorType: MeasuresService.formatApparatusSensorType(measure.apparatusSensorType),
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
          rain: measure.rain,
          flightNumber: measure.flightNumber,
          seatNumber: measure.seatNumber,
          storm: measure.storm,
          windowSeat: measure.windowSeat,
          calibrationFunction: measure.calibrationFunction
        }
      };
      return this.httpClient.post(environment.API_URI, payload);
    } else {
      return of(null);
    }
  }

  private static formatApparatusSensorType(apparatusSensorType?: string): ApparatusSensorType | undefined {
    if (apparatusSensorType !== undefined) {
      if (apparatusSensorType.includes(ApparatusSensorType.Geiger)) {
        return ApparatusSensorType.Geiger;
      } else if (apparatusSensorType.includes(ApparatusSensorType.Photodiode)) {
        return ApparatusSensorType.Photodiode;
      }
    }
    return undefined;
  }

  canPublishMeasure(measure: Measure | MeasureSeries): boolean {
    switch (measure.type) {
      case MeasureType.Measure:
        return this.hasSufficientAccuracyToBePublished(measure);
      case MeasureType.MeasureSeries:
        return measure.measures.some(this.hasSufficientAccuracyToBePublished);
    }
  }

  private hasSufficientAccuracyToBePublished(measure: Measure) {
    const hasSufficientAccuracyToBePublished = (
      measure.accuracy !== undefined &&
      measure.accuracy !== null &&
      measure.accuracy < PositionAccuracyThreshold.No &&
      measure.endAccuracy !== undefined &&
      measure.endAccuracy !== null &&
      measure.endAccuracy < PositionAccuracyThreshold.No
    );
    if (!hasSufficientAccuracyToBePublished) {
      // Only allow publication with poor accuracy in plane mode with fligh number set
      return measure.measurementEnvironment == MeasureEnvironment.Plane && measure.flightNumber != undefined && measure.flightNumber.length > 2
    } else {
      return true;
    }
  }

  handlePoorAccuracyInPlaneMode(measure: Measure) {
    if (measure.measurementEnvironment == MeasureEnvironment.Plane) {
      measure.accuracy = Math.min(measure.accuracy ? measure.accuracy : Infinity, 40000)
      measure.altitudeAccuracy = Math.min(measure.altitudeAccuracy ? measure.altitudeAccuracy : Infinity, 15000)
      if (measure.accuracy > PositionAccuracyThreshold.Poor) {
        measure.latitude = 0
        measure.longitude = 0
      }
      if (measure.altitudeAccuracy > PositionAccuracyThreshold.Poor) {
        measure.altitude = 10000
      }
    }
  }
}
