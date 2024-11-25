import { Location } from '@capacitor-community/background-geolocation';
import { TranslateService } from '@ngx-translate/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AlertService } from '@app/services/alert.service';
import { NavigationService } from '@app/services/navigation.service';
import { AbstractDevice, DeviceType } from '@app/states/devices/abstract-device';
import { DeviceConnectionLost } from '@app/states/devices/devices.action';
import { Form } from '@app/states/formModel';
import { DateService } from '@app/states/measures/date.service';
import {
  AbstractMeasure,
  Measure,
  MeasureEnvironment,
  MeasureReport,
  MeasureSeries,
  MeasureSeriesParams,
  MeasureSeriesParamsSelected,
  MeasureSeriesReport,
  MeasureType,
  PositionAccuracyThreshold,
} from '@app/states/measures/measure';
import {
  AddMeasureScanStep,
  AddRecentTag,
  CancelMeasure,
  DeleteAllMeasures,
  DeleteMeasure,
  DisableAutoPublish,
  DisableExpertMode,
  DisableFakeHitsMode,
  DisablePlaneMode,
  EnableAutoPublish,
  EnableExpertMode,
  EnableFakeHitsMode,
  EnablePLaneMode,
  InitMeasures,
  PositionChanged,
  PublishMeasure,
  PublishMeasureError,
  PublishMeasureSuccess,
  ShowMeasure,
  StartManualMeasure,
  StartMeasure,
  StartMeasureReport,
  StartMeasureScan,
  StartMeasureSeriesParams,
  StartMeasureSeriesReport,
  StartNextMeasureSeries,
  StopMeasure,
  StopMeasureReport,
  StopMeasureScan,
  StopMeasureSeries,
  StopMeasureSeriesParams,
  StopMeasureSeriesReport,
} from '@app/states/measures/measures.action';
import { MeasuresService } from '@app/states/measures/measures.service';
import { Device } from '@capacitor/device';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

/**
 * Max duration between 2 measure steps before the device connection is considered as lost
 */
const TIMEOUT_DURATION = 35000;

export interface MeasuresStateModel {
  measures: (Measure | MeasureSeries)[];
  currentPosition?: Location;
  currentMeasure?: Measure;
  currentSeries?: MeasureSeries;
  canEndCurrentScan: boolean;
  recentTags: string[];
  measureReport?: Form<MeasureReport>;
  measureSeriesParams?: Form<MeasureSeriesParams>;
  measureSeriesReport?: Form<MeasureSeriesReport>;
  params: {
    expertMode: boolean;
    autoPublish: boolean;
    planeMode: boolean;
    fakeHitsMode: boolean;
  };
}

@State<MeasuresStateModel>({
  name: 'measures',
  defaults: {
    measures: [],
    recentTags: [],
    canEndCurrentScan: false,
    params: {
      expertMode: false,
      autoPublish: false,
      planeMode: false,
      fakeHitsMode: false,
    },
  },
})
@Injectable()
export class MeasuresState {
  public static MISSING_STRING = '<Missing>';
  deviceUUID: string = MeasuresState.MISSING_STRING;
  devicePlatform: string = MeasuresState.MISSING_STRING;
  deviceOsVersion: string = MeasuresState.MISSING_STRING;
  deviceModel: string = MeasuresState.MISSING_STRING;

  constructor(
    private measuresService: MeasuresService,
    private dateService: DateService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private navigationService: NavigationService,
    private store: Store,
  ) {}

  @Selector()
  static expertMode({ params }: MeasuresStateModel): boolean {
    return params.expertMode;
  }

  @Selector()
  static fakeHitsMode({ params }: MeasuresStateModel): boolean {
    return params.fakeHitsMode;
  }

  @Selector()
  static autoPublish({ params }: MeasuresStateModel): boolean {
    return params.autoPublish;
  }

  @Selector()
  static planeMode({ params }: MeasuresStateModel): boolean {
    return params.planeMode;
  }

  @Selector()
  static currentPosition({ currentPosition }: MeasuresStateModel): Location | undefined {
    return currentPosition;
  }

  @Selector()
  static positionAccuracy({ currentPosition }: MeasuresStateModel): number {
    return currentPosition?.accuracy ?? PositionAccuracyThreshold.No;
  }

  @Selector()
  static currentMeasure({ currentMeasure }: MeasuresStateModel): Measure | undefined {
    return currentMeasure;
  }

  @Selector()
  static currentSeries({ currentSeries }: MeasuresStateModel): MeasureSeries | undefined {
    return currentSeries;
  }

  @Selector()
  static measures({ measures }: MeasuresStateModel): (Measure | MeasureSeries)[] {
    return [...measures].sort((a, b) => b.startTime - a.startTime);
  }

  @Selector()
  static recentTags({ recentTags }: MeasuresStateModel): string[] {
    return recentTags;
  }

  @Selector()
  static canEndCurrentScan({ canEndCurrentScan }: MeasuresStateModel): boolean {
    return canEndCurrentScan;
  }

  @Action(InitMeasures)
  initMeasures(
    { patchState, getState }: StateContext<MeasuresStateModel>,
    { measures, params, recentTags, currentSeries }: InitMeasures,
  ) {
    const { params: defaultParams } = getState();
    const patch = { measures, params: { ...defaultParams, ...params }, recentTags };
    if (currentSeries && currentSeries.measures.length) {
      this.alertService.show({
        header: this.translateService.instant('MEASURE_SERIES.ABORTED_SERIES.TITLE'),
        message: this.translateService.instant('MEASURE_SERIES.ABORTED_SERIES.MESSAGE'),
        backdropDismiss: false,
        buttons: [
          {
            text: this.translateService.instant('MEASURE_SERIES.ABORTED_SERIES.DELETE_SERIES'),
            handler: () => patchState(patch),
          },
          {
            text: this.translateService.instant('MEASURE_SERIES.ABORTED_SERIES.GO_TO_REPORT'),
            handler: () => {
              patchState({ ...patch, currentSeries });
              this.navigationService.navigateRoot(['measure', 'report-series']);
            },
          },
        ],
      });
    } else {
      patchState(patch);
    }
  }

  @Action(EnableExpertMode)
  enableExpertMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, expertMode: true },
    });
  }

  @Action(DisableExpertMode)
  disableExpertMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, expertMode: false },
    });
  }

  @Action(EnableFakeHitsMode)
  enableFakeHitsMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, fakeHitsMode: true },
    });
  }

  @Action(DisableFakeHitsMode)
  disableFakeHitsMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, fakeHitsMode: false },
    });
  }

  @Action(EnableAutoPublish)
  enableAutoPublish({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, autoPublish: true },
    });
  }

  @Action(DisableAutoPublish)
  disableAutoPublish({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, autoPublish: false },
    });
  }

  @Action(EnablePLaneMode)
  enablePlaneMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, planeMode: true },
    });
  }

  @Action(DisablePlaneMode)
  disablePlaneMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, planeMode: false },
    });
  }

  @Action(PositionChanged)
  positionChanged({ patchState, getState }: StateContext<MeasuresStateModel>, { position }: PositionChanged) {
    patchState({
      currentPosition: position,
    });

    // If position accuracy is acceptable
    if (
      position &&
      position.latitude &&
      position.latitude != 0 &&
      position.accuracy < PositionAccuracyThreshold.Inaccurate
    ) {
      // If current measure or serie has no good position, let's patch it with current position
      const { currentMeasure, currentSeries } = getState();
      if (
        currentMeasure &&
        (!currentMeasure.latitude ||
          currentMeasure.latitude == 0 ||
          !currentMeasure.accuracy ||
          currentMeasure.accuracy > PositionAccuracyThreshold.Poor)
      ) {
        currentMeasure.latitude = position.latitude;
        currentMeasure.longitude = position.longitude;
        currentMeasure.altitude = position.altitude ? position.altitude : undefined;
        currentMeasure.altitudeAccuracy = position.altitudeAccuracy ? position.altitudeAccuracy : undefined;
        currentMeasure.accuracy = position.accuracy;
        patchState({
          currentMeasure: currentMeasure,
        });
      }
      if (currentSeries && currentSeries.measures) {
        const firstMeasure = currentSeries.measures[0];
        if (
          firstMeasure &&
          (!firstMeasure.latitude ||
            firstMeasure.latitude == 0 ||
            !firstMeasure.accuracy ||
            firstMeasure.accuracy > PositionAccuracyThreshold.Poor)
        ) {
          firstMeasure.latitude = position.latitude;
          firstMeasure.longitude = position.longitude;
          firstMeasure.altitude = position.altitude ? position.altitude : undefined;
          firstMeasure.altitudeAccuracy = position.altitudeAccuracy ? position.altitudeAccuracy : undefined;
          firstMeasure.accuracy = position.accuracy;
          patchState({
            currentSeries: currentSeries,
          });
        }
      }
    }
  }

  @Action(StartMeasure)
  async startMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, { device }: StartMeasure) {
    await this.computeDeviceInfoIfMissing();
    const { params } = getState();
    const currentMeasure: Measure = {
      ...new Measure(
        device.apparatusId,
        device.apparatusVersion,
        device.apparatusSensorType,
        device.apparatusTubeType,
        this.deviceUUID,
        this.devicePlatform,
        this.deviceOsVersion,
        this.deviceModel,
      ),
      measurementEnvironment: params.planeMode ? MeasureEnvironment.Plane : undefined,
    };
    patchState({
      currentMeasure,
    });
  }

  @Action(StartManualMeasure)
  async startManualMeasure({ getState, patchState }: StateContext<MeasuresStateModel>) {
    await this.computeDeviceInfoIfMissing();
    const { currentPosition, params } = getState();
    let currentMeasure: Measure = {
      ...new Measure(
        undefined,
        undefined,
        undefined,
        undefined,
        this.deviceUUID,
        this.devicePlatform,
        this.deviceOsVersion,
        this.deviceModel,
        true,
      ),
      startTime: Date.now(),
      measurementEnvironment: params.planeMode ? MeasureEnvironment.Plane : undefined,
    };
    currentMeasure = Measure.updateStartPosition(currentMeasure, currentPosition);
    currentMeasure = Measure.updateEndPosition(currentMeasure, currentPosition);
    patchState({
      currentMeasure,
    });
  }

  @Action(StopMeasure)
  stopMeasure(stateContext: StateContext<MeasuresStateModel>) {
    const { currentMeasure } = stateContext.getState();
    if (currentMeasure) {
      const patch: Partial<MeasuresStateModel> = { currentMeasure: undefined };
      if (currentMeasure.sent) {
        stateContext.patchState(patch);
      } else {
        const measure = { ...currentMeasure, steps: undefined };
        MeasuresState.stopAbstractMeasure(measure, patch, stateContext);
      }
    }
  }

  @Action(StopMeasureSeries)
  stopMeasureSeries(stateContext: StateContext<MeasuresStateModel>) {
    const { currentSeries } = stateContext.getState();
    if (currentSeries) {
      const patch: Partial<MeasuresStateModel> = { currentSeries: undefined };
      if (currentSeries.sent) {
        stateContext.patchState(patch);
      } else {
        const series = { ...currentSeries };
        MeasuresState.stopAbstractMeasure(series, patch, stateContext);
      }
    }
  }

  private static stopAbstractMeasure(
    abstractMeasure: Measure | MeasureSeries,
    patch: Partial<MeasuresStateModel>,
    { getState, patchState, dispatch }: StateContext<MeasuresStateModel>,
  ) {
    const { measures, params } = getState();
    const measureIndex = measures.findIndex((historyMeasure) => historyMeasure.id === abstractMeasure.id);
    if (measureIndex > -1) {
      patch.measures = [...measures.slice(0, measureIndex), abstractMeasure, ...measures.slice(measureIndex + 1)];
    } else {
      patch.measures = [...measures, abstractMeasure];
    }
    patchState(patch);
    if (params.autoPublish) {
      dispatch(new PublishMeasure(abstractMeasure));
    }
  }

  @Action(CancelMeasure)
  cancelMeasure({ patchState }: StateContext<MeasuresStateModel>) {
    patchState({
      currentMeasure: undefined,
      measureReport: undefined,
      measureSeriesParams: undefined,
      currentSeries: undefined,
      measureSeriesReport: undefined,
      canEndCurrentScan: false,
    });
  }

  @Action(StartMeasureSeriesParams)
  startMeasureSeries({ patchState }: StateContext<MeasuresStateModel>) {
    const model: MeasureSeriesParams = {
      seriesDurationLimit: 24,
      measureHitsLimit: 50,
      measureDurationLimit: 5,
      paramSelected: MeasureSeriesParamsSelected.measureDurationLimit,
    };
    patchState({
      measureSeriesParams: {
        model,
        dirty: false,
        status: '',
        errors: {},
      },
    });
  }

  @Action(StopMeasureSeriesParams)
  stopMeasureSeriesParam({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { measureSeriesParams } = getState();
    if (measureSeriesParams) {
      patchState({
        measureSeriesParams: undefined,
        currentSeries: new MeasureSeries({
          ...measureSeriesParams.model,
          measureDurationLimit: measureSeriesParams.model.measureDurationLimit * 60 * 1000,
          seriesDurationLimit: measureSeriesParams.model.seriesDurationLimit * 60 * 60 * 1000,
        }),
      });
    }
  }

  @Action(AddMeasureScanStep)
  addMeasureScanStep(
    { getState, patchState, dispatch }: StateContext<MeasuresStateModel>,
    { step, device }: AddMeasureScanStep,
  ) {
    const { currentMeasure, currentSeries, params } = getState();
    if (currentMeasure && currentMeasure.steps) {
      const stepDuration =
        currentMeasure.steps.length > 0 ? step.ts - currentMeasure.steps[currentMeasure.steps.length - 1].ts : 0;
      if (device.deviceType !== DeviceType.PocketGeiger && stepDuration > TIMEOUT_DURATION) {
        return dispatch(new DeviceConnectionLost(true));
      } else {
        let newCurrentMeasure: Measure = {
          ...currentMeasure,
          endTime: step.ts,
          steps: [...currentMeasure.steps, step],
        };
        if (newCurrentMeasure.startTime === undefined) {
          newCurrentMeasure.startTime = step.ts - device.hitsPeriod;
        }
        newCurrentMeasure = this.updateMeasureHits(newCurrentMeasure, params.planeMode, { step, device }, getState());
        newCurrentMeasure = Measure.updateTemperature(newCurrentMeasure);
        const patch: Partial<MeasuresStateModel> = { currentMeasure: newCurrentMeasure };
        if (
          newCurrentMeasure.hitsAccuracy !== undefined &&
          newCurrentMeasure.hitsAccuracy >= device.hitsAccuracyThreshold.accurate
        ) {
          patch.canEndCurrentScan = true;
        }
        patchState(patch);
        if (
          currentSeries &&
          MeasuresState.shouldStopMeasureSeriesCurrentScan(device, currentSeries, newCurrentMeasure, step.ts)
        ) {
          return dispatch(new StartNextMeasureSeries(device));
        }
      }
    }
    return of(null);
  }

  private updateMeasureHits(
    measure: Measure,
    planeMode: boolean,
    { step, device }: AddMeasureScanStep,
    measureStateModel: MeasuresStateModel,
  ): Measure {
    const newMeasure = { ...measure };
    if (measureStateModel.params.fakeHitsMode) {
      // If fake hits mode is active, make sure we are not in beta environment (ignore if not)
      const splitted = environment.APP_NAME_VERSION.split(' ');
      if (splitted.length >= 2) {
        const envName = splitted[splitted.length - 1] + ' ' + splitted[splitted.length - 2];
        if (
          envName.toLocaleLowerCase().indexOf('beta') != -1 ||
          envName.toLocaleLowerCase().indexOf('mockdevice') != -1
        ) {
          step.hitsNumber = 10 + (step.hitsNumber ? step.hitsNumber : 0);
        }
      }
    }

    if (step.hitsNumber !== undefined) {
      newMeasure.hitsNumber = measure.hitsNumber ? measure.hitsNumber + step.hitsNumber : step.hitsNumber;
      const [value, calibrationFunction] = this.measuresService.computeRadiationValue(newMeasure, device, planeMode);
      newMeasure.hitsAccuracy = newMeasure.hitsNumber;
      newMeasure.value = value;
      newMeasure.calibrationFunction = calibrationFunction;
    } else if (step.hitsAccuracy !== undefined && step.value !== undefined) {
      newMeasure.hitsAccuracy = step.hitsAccuracy;
      newMeasure.value = step.value;
    }
    return newMeasure;
  }

  private static shouldStopMeasureSeriesCurrentScan(
    device: AbstractDevice,
    measureSeries: MeasureSeries,
    measure: Measure,
    currentTime: number,
  ): boolean {
    switch (measureSeries.params.paramSelected) {
      case MeasureSeriesParamsSelected.measureDurationLimit:
        return (
          currentTime - measure.startTime > measureSeries.params.measureDurationLimit &&
          measure.hitsAccuracy !== undefined &&
          measure.hitsAccuracy > device.hitsAccuracyThreshold.accurate
        );
      case MeasureSeriesParamsSelected.measureHitsLimit:
        return (
          measure.hitsAccuracy !== undefined &&
          measure.hitsAccuracy > measureSeries.params.measureHitsLimit &&
          currentTime - measure.startTime > 10000
        );
    }
  }

  @Action(StartMeasureScan)
  startMeasureScan({ getState, patchState }: StateContext<MeasuresStateModel>, { device }: StartMeasureScan) {
    const { currentMeasure, currentSeries, currentPosition } = getState();
    if (currentMeasure) {
      return this.measuresService.startMeasureScan(device).pipe(
        tap(() => {
          const patch: Partial<MeasuresStateModel> = {};
          if (currentSeries) {
            patch.currentSeries = {
              ...currentSeries,
              startTime: Date.now(),
            };
          }
          patch.currentMeasure = Measure.updateStartPosition(getState().currentMeasure!, currentPosition);
          patchState(patch);
        }),
      );
    } else {
      return of(null);
    }
  }

  @Action(StopMeasureScan)
  stopMeasureScan({ getState, patchState }: StateContext<MeasuresStateModel>, { device }: StopMeasureScan) {
    const { currentMeasure, currentSeries, currentPosition } = getState();
    if (currentMeasure) {
      const patch: Partial<MeasuresStateModel> = {
        canEndCurrentScan: false,
      };
      const updatedMeasure = Measure.updateEndPosition(currentMeasure, currentPosition);
      if (currentSeries) {
        patch.currentMeasure = undefined;
        if (
          updatedMeasure.hitsAccuracy !== undefined &&
          updatedMeasure.hitsAccuracy >= device.hitsAccuracyThreshold.accurate
        ) {
          patch.currentSeries = MeasureSeries.addMeasureToSeries(currentSeries, updatedMeasure);
        }
      } else {
        patch.currentMeasure = updatedMeasure;
      }
      patchState(patch);
    }
  }

  @Action(StartNextMeasureSeries)
  async startNextMeasureSeries(
    { getState, patchState, dispatch }: StateContext<MeasuresStateModel>,
    { device }: StartNextMeasureSeries,
  ) {
    const { currentMeasure, currentSeries, currentPosition } = getState();
    await this.computeDeviceInfoIfMissing();
    if (currentMeasure && currentSeries) {
      if (currentMeasure.endTime! - currentSeries.startTime > currentSeries.params.seriesDurationLimit) {
        return dispatch(new StopMeasureScan(device));
      } else {
        const updatedMeasure = Measure.updateEndPosition(currentMeasure, currentPosition);
        const newMeasure = Measure.updateStartPosition(
          new Measure(
            currentMeasure.apparatusId,
            currentMeasure.apparatusVersion,
            currentMeasure.apparatusSensorType,
            currentMeasure.apparatusTubeType,
            this.deviceUUID,
            this.devicePlatform,
            this.deviceOsVersion,
            this.deviceModel,
          ),
          currentPosition,
        );
        patchState({
          currentMeasure: newMeasure,
          currentSeries: MeasureSeries.addMeasureToSeries(currentSeries, updatedMeasure),
        });
        return of(null);
      }
    } else {
      return of(null);
    }
  }

  @Action(StartMeasureReport)
  startMeasureReport({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { currentMeasure } = getState();
    if (currentMeasure) {
      const startTimeIOSString = this.dateService.toISOString(currentMeasure.startTime);
      const model: MeasureReport = {
        latitude: currentMeasure.latitude ? Number(currentMeasure.latitude.toFixed(7)) : undefined,
        longitude: currentMeasure.longitude ? Number(currentMeasure.longitude.toFixed(7)) : undefined,
        endLatitude: currentMeasure.endLatitude ? Number(currentMeasure.endLatitude.toFixed(7)) : undefined,
        endLongitude: currentMeasure.endLongitude ? Number(currentMeasure.endLongitude.toFixed(7)) : undefined,
        date: startTimeIOSString,
        startTime: startTimeIOSString,
        duration: currentMeasure.endTime
          ? this.dateService.toISODuration(currentMeasure.endTime - currentMeasure.startTime)
          : undefined,
        temperature:
          currentMeasure.temperature !== undefined ? Number(currentMeasure.temperature.toFixed(2)) : undefined,
        hitsNumber: currentMeasure.hitsNumber,
        value: currentMeasure.value !== undefined ? Number(currentMeasure.value.toFixed(3)) : undefined,
        measurementHeight: currentMeasure.measurementHeight,
        description: currentMeasure.description,
        tags: currentMeasure.tags,
        measurementEnvironment: currentMeasure.measurementEnvironment,
        rain: currentMeasure.rain,
        enclosedObject: currentMeasure.enclosedObject,
        storm: currentMeasure.storm,
        windowSeat: currentMeasure.windowSeat,
        flightNumber: currentMeasure.flightNumber,
        seatNumber: currentMeasure.seatNumber,
      };
      patchState({
        measureReport: {
          model,
          dirty: false,
          status: '',
          errors: {},
        },
      });
    }
  }

  @Action(StartMeasureSeriesReport)
  startMeasureSeriesReport({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { currentSeries } = getState();
    if (currentSeries) {
      const startTimeIOSString = this.dateService.toISOString(currentSeries.startTime!);
      const model: MeasureSeriesReport = {
        seriesNumbersMeasures: currentSeries.measures.length,
        measureDurationLimit: this.dateService.toISODuration(currentSeries.params.measureDurationLimit),
        measureHitsLimit: currentSeries.params.measureHitsLimit,
        date: startTimeIOSString,
        startTime: startTimeIOSString,
        duration: currentSeries.endTime
          ? this.dateService.toISODuration(currentSeries.endTime - currentSeries.startTime!)
          : undefined,
        hitsNumberAverage:
          currentSeries.measures.length > 0 && currentSeries.measures[0].hitsNumber !== undefined
            ? Number(
                (
                  currentSeries.measures.reduce((acc, measure) => acc + measure.hitsNumber!, 0) /
                  currentSeries.measures.length
                ).toFixed(1),
              )
            : undefined,
        valueAverage: Number(
          (
            currentSeries.measures.reduce((acc, measure) => acc + measure.value, 0) / currentSeries.measures.length
          ).toFixed(3),
        ),
        measurementHeight: currentSeries.measures[0].measurementHeight,
        description: currentSeries.measures[0].description,
        tags: currentSeries.measures[0].tags,
        measurementEnvironment: currentSeries.measures[0].measurementEnvironment,
        rain: currentSeries.measures[0].rain,
        storm: currentSeries.measures[0].storm,
        windowSeat: currentSeries.measures[0].windowSeat,
        flightNumber: currentSeries.measures[0].flightNumber,
        seatNumber: currentSeries.measures[0].seatNumber,
      };
      patchState({
        measureSeriesReport: {
          model,
          dirty: false,
          status: '',
          errors: {},
        },
      });
    }
  }

  @Action(StopMeasureReport)
  stopMeasureReport({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { currentMeasure, measureReport } = getState();
    if (currentMeasure && measureReport) {
      let updatedCurrentMeasure: Measure = {
        ...currentMeasure,
        measurementHeight: measureReport.model.measurementHeight,
        measurementEnvironment: measureReport.model.measurementEnvironment,
        rain: measureReport.model.rain,
        storm: measureReport.model.storm,
        flightNumber: measureReport.model.flightNumber ? measureReport.model.flightNumber.toUpperCase() : undefined,
        seatNumber: measureReport.model.seatNumber ? measureReport.model.seatNumber.toUpperCase() : undefined,
        windowSeat: measureReport.model.windowSeat,
        description: measureReport.model.description,
        tags: measureReport.model.tags,
        enclosedObject: measureReport.model.enclosedObject,
      };
      if (currentMeasure.manualReporting) {
        updatedCurrentMeasure = {
          ...updatedCurrentMeasure,
          temperature: measureReport.model.temperature,
          value: measureReport.model.value!,
          hitsNumber: measureReport.model.hitsNumber,
        };
        if (measureReport.model.duration !== undefined) {
          const durationDate = new Date(measureReport.model.duration);
          const hours = durationDate.getHours();
          const minutes = durationDate.getMinutes();
          const seconds = durationDate.getSeconds();
          updatedCurrentMeasure = {
            ...updatedCurrentMeasure,
            endTime: currentMeasure.startTime + (hours * 60 * 60 + minutes * 60 + seconds) * 1000,
          };
        }
      }
      patchState({
        measureReport: undefined,
        currentMeasure: updatedCurrentMeasure,
      });
    }
  }

  @Action(StopMeasureSeriesReport)
  stopMeasureSeriesReport({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { currentSeries, measureSeriesReport } = getState();
    if (currentSeries && measureSeriesReport) {
      patchState({
        measureSeriesReport: undefined,
        currentSeries: {
          ...currentSeries,
          measures: currentSeries.measures.map((measure) => ({
            ...measure,
            measurementHeight: measureSeriesReport.model.measurementHeight,
            measurementEnvironment: measureSeriesReport.model.measurementEnvironment,
            rain: measureSeriesReport.model.rain,
            description: measureSeriesReport.model.description,
            tags: measureSeriesReport.model.tags,
            storm: measureSeriesReport.model.storm,
            windowSeat: measureSeriesReport.model.windowSeat,
            flightNumber: measureSeriesReport.model.flightNumber
              ? measureSeriesReport.model.flightNumber.toUpperCase()
              : undefined,
            seatNumber: measureSeriesReport.model.seatNumber
              ? measureSeriesReport.model.seatNumber.toUpperCase()
              : undefined,
          })),
        },
      });
    }
  }

  @Action(PublishMeasure)
  publishMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, { measure }: PublishMeasure) {
    if (!measure.sent) {
      let { measures } = getState();
      const index = measures.findIndex((stateMeasure) => stateMeasure.id === measure.id);
      if (index !== -1) {
        return this.measuresService.publishMeasure(measure).subscribe((m) => {
          measures = getState().measures;
          if ((m as AbstractMeasure)?.type == MeasureType.Measure) {
            patchState({
              measures: [...measures.slice(0, index), { ...(m as Measure) }, ...measures.slice(index + 1)],
            });
          } else {
            patchState({
              measures: [...measures.slice(0, index), { ...(m as MeasureSeries) }, ...measures.slice(index + 1)],
            });
          }
          if (!(m as AbstractMeasure).sent) {
            this.store.dispatch(new PublishMeasureError(m as AbstractMeasure));
            return of(null);
          } else {
            this.store.dispatch(new PublishMeasureSuccess(m as AbstractMeasure));
            return of(m);
          }
        });
      }
    }
    return of(null);
  }

  @Action(DeleteMeasure)
  deleteMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, { measure }: DeleteMeasure) {
    if (!measure.sent) {
      const { measures } = getState();
      const index = measures.findIndex((stateMeasure) => stateMeasure.id === measure.id);
      if (index !== -1) {
        patchState({
          measures: [...measures.slice(0, index), ...measures.slice(index + 1)],
        });
      }
    }
  }

  @Action(DeleteAllMeasures)
  deleteAllMeasures({ patchState }: StateContext<MeasuresStateModel>) {
    patchState({
      measures: [],
    });
  }

  @Action(ShowMeasure)
  showMeasure({ patchState }: StateContext<MeasuresStateModel>, { measure }: PublishMeasure) {
    if (measure.type === MeasureType.Measure) {
      patchState({
        currentMeasure: { ...measure },
      });
    } else {
      patchState({
        currentSeries: { ...measure },
      });
    }
  }

  @Action(AddRecentTag)
  addRecentTag({ getState, patchState }: StateContext<MeasuresStateModel>, { tag }: AddRecentTag) {
    const { recentTags } = getState();
    const index = recentTags.indexOf(tag);
    patchState({
      recentTags:
        index === -1 ? [tag, ...recentTags] : [tag, ...recentTags.slice(0, index), ...recentTags.slice(index + 1)],
    });
  }

  async computeDeviceInfoIfMissing() {
    if (this.deviceUUID == MeasuresState.MISSING_STRING) {
      this.deviceUUID = (await Device.getId()).identifier;
    }
    if (this.devicePlatform == MeasuresState.MISSING_STRING) {
      const deviceInfo = await Device.getInfo();
      this.devicePlatform = deviceInfo.platform;
      this.deviceModel = deviceInfo.model;
      this.deviceOsVersion = deviceInfo.osVersion;
    }
  }
}
