import { Device } from '@ionic-native/device/ngx';
import { Location } from '@mauron85/cordova-plugin-background-geolocation';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Form } from '../../app.component';
import { AbstractDevice } from '../devices/abstract-device';
import { DateService } from './date.service';
import {
  Measure,
  MeasureEnvironment,
  MeasureReport,
  MeasureSeries,
  MeasureSeriesParams,
  MeasureSeriesParamsSelected,
  MeasureSeriesReport,
  MeasureType,
  PositionAccuracyThreshold
} from './measure';
import {
  AddMeasureScanStep,
  AddRecentTag,
  CancelMeasure,
  DeleteAllMeasures,
  DeleteMeasure,
  DisableAutoPublish,
  DisableExpertMode,
  DisablePlaneMode,
  EnableAutoPublish,
  EnableExpertMode,
  EnablePLaneMode,
  InitMeasures,
  PositionChanged,
  PublishMeasure,
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
  StopMeasureSeriesReport
} from './measures.action';
import { MeasuresService } from './measures.service';
import { PositionService } from './position.service';

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
      planeMode: false
    }
  }
})
export class MeasuresState {
  constructor(
    private positionService: PositionService,
    private device: Device,
    private measuresService: MeasuresService,
    private dateService: DateService
  ) {}

  @Selector()
  static expertMode({ params }: MeasuresStateModel): boolean {
    return params.expertMode;
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
    return currentPosition ? currentPosition.accuracy : PositionAccuracyThreshold.No;
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
    { measures, params, recentTags }: InitMeasures
  ) {
    const { params: defaultParams } = getState();
    patchState({ measures, params: { ...defaultParams, ...params }, recentTags });
  }

  @Action(EnableExpertMode)
  enableExpertMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, expertMode: true }
    });
  }

  @Action(DisableExpertMode)
  disableExpertMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, expertMode: false }
    });
  }

  @Action(EnableAutoPublish)
  enableAutoPublish({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, autoPublish: true }
    });
  }

  @Action(DisableAutoPublish)
  disableAutoPublish({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, autoPublish: false }
    });
  }

  @Action(EnablePLaneMode)
  enablePlaneMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, planeMode: true }
    });
  }

  @Action(DisablePlaneMode)
  disablePlaneMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, planeMode: false }
    });
  }

  @Action(PositionChanged)
  positionChanged({ patchState }: StateContext<MeasuresStateModel>, { position }: PositionChanged) {
    patchState({
      currentPosition: position
    });
  }

  @Action(StartMeasure)
  startMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, { device }: StartMeasure) {
    const { params } = getState();
    const currentMeasure: Measure = {
      ...new Measure(
        device.apparatusId,
        device.apparatusVersion,
        device.apparatusSensorType,
        device.apparatusTubeType,
        this.device.uuid,
        this.device.platform,
        this.device.version,
        this.device.model
      ),
      measurementEnvironment: params.planeMode ? MeasureEnvironment.Plane : undefined
    };
    patchState({
      currentMeasure
    });
  }

  @Action(StartManualMeasure)
  startManualMeasure({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { currentPosition, params } = getState();
    let currentMeasure: Measure = {
      ...new Measure(
        undefined,
        undefined,
        undefined,
        undefined,
        this.device.uuid,
        this.device.platform,
        this.device.version,
        this.device.model,
        true
      ),
      startTime: Date.now(),
      measurementEnvironment: params.planeMode ? MeasureEnvironment.Plane : undefined
    };
    currentMeasure = Measure.updateStartPosition(currentMeasure, currentPosition);
    currentMeasure = Measure.updateEndPosition(currentMeasure, currentPosition);
    patchState({
      currentMeasure
    });
  }

  @Action(StopMeasure)
  stopMeasure({ getState, patchState, dispatch }: StateContext<MeasuresStateModel>) {
    const { currentMeasure, measures, params } = getState();
    if (currentMeasure) {
      const patch: Partial<MeasuresStateModel> = { currentMeasure: undefined };
      if (currentMeasure.sent) {
        patchState(patch);
      } else {
        const measure = { ...currentMeasure, steps: undefined };
        const measureIndex = measures.findIndex(historyMeasure => historyMeasure.id === measure.id);
        if (measureIndex > -1) {
          patch.measures = [...measures.slice(0, measureIndex), measure, ...measures.slice(measureIndex + 1)];
        } else {
          patch.measures = [...measures, measure];
        }
        patchState(patch);
        if (params.autoPublish) {
          dispatch(new PublishMeasure(measure));
        }
      }
    }
  }

  @Action(StopMeasureSeries)
  stopMeasureSeries({ getState, patchState, dispatch }: StateContext<MeasuresStateModel>) {
    const { currentSeries, measures, params } = getState();
    if (currentSeries) {
      const patch: Partial<MeasuresStateModel> = { currentSeries: undefined };
      if (currentSeries.sent) {
        patchState(patch);
      } else {
        const series = { ...currentSeries };
        const measureIndex = measures.findIndex(historyMeasure => historyMeasure.id === series.id);
        if (measureIndex > -1) {
          patch.measures = [...measures.slice(0, measureIndex), series, ...measures.slice(measureIndex + 1)];
        } else {
          patch.measures = [...measures, series];
        }
        patchState(patch);
        if (params.autoPublish) {
          dispatch(new PublishMeasure(series));
        }
      }
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
      canEndCurrentScan: false
    });
  }

  @Action(StartMeasureSeriesParams)
  startMeasureSeries({ patchState }: StateContext<MeasuresStateModel>) {
    const model: MeasureSeriesParams = {
      seriesDurationLimit: 24,
      measureHitsLimit: 50,
      measureDurationLimit: 5,
      paramSelected: MeasureSeriesParamsSelected.measureDurationLimit
    };
    patchState({
      measureSeriesParams: {
        model,
        dirty: false,
        status: '',
        errors: {}
      }
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
          seriesDurationLimit: measureSeriesParams.model.seriesDurationLimit * 60 * 60 * 1000
        })
      });
    }
  }

  @Action(AddMeasureScanStep)
  addMeasureScanStep(
    { getState, patchState, dispatch }: StateContext<MeasuresStateModel>,
    { step, device }: AddMeasureScanStep
  ) {
    const { currentMeasure, currentSeries, params } = getState();
    if (currentMeasure && currentMeasure.steps) {
      const newCurrentMeasure = {
        ...currentMeasure,
        endTime: step.ts,
        steps: [...currentMeasure.steps, step]
      };
      if (newCurrentMeasure.startTime === undefined) {
        newCurrentMeasure.startTime = step.ts - device.hitsPeriod;
      }
      if (step.hitsNumber !== undefined) {
        newCurrentMeasure.hitsNumber = currentMeasure.hitsNumber
          ? currentMeasure.hitsNumber + step.hitsNumber
          : step.hitsNumber;
        const [value, calibrationFunction] = this.measuresService.computeRadiationValue(
          newCurrentMeasure,
          device,
          params.planeMode
        );
        newCurrentMeasure.hitsAccuracy = newCurrentMeasure.hitsNumber;
        newCurrentMeasure.value = value;
        newCurrentMeasure.calibrationFunction = calibrationFunction;
      } else if (step.hitsAccuracy !== undefined && step.value !== undefined) {
        newCurrentMeasure.hitsAccuracy = step.hitsAccuracy;
        newCurrentMeasure.value = step.value;
      }
      if (newCurrentMeasure.steps[0] && newCurrentMeasure.steps[0].temperature !== undefined) {
        newCurrentMeasure.temperature =
          newCurrentMeasure.steps
            .map(currentMeasureStep => currentMeasureStep.temperature!)
            .reduce((acc, current) => acc + current) / newCurrentMeasure.steps.length;
      }
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
    return of(null);
  }

  private static shouldStopMeasureSeriesCurrentScan(
    device: AbstractDevice,
    measureSeries: MeasureSeries,
    measure: Measure,
    currentTime: number
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
              startTime: Date.now()
            };
          }
          patch.currentMeasure = Measure.updateStartPosition(getState().currentMeasure!, currentPosition);
          patchState(patch);
        })
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
        canEndCurrentScan: false
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
  startNextMeasureSeries(
    { getState, patchState, dispatch }: StateContext<MeasuresStateModel>,
    { device }: StartNextMeasureSeries
  ) {
    const { currentMeasure, currentSeries, currentPosition } = getState();
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
            this.device.uuid,
            this.device.platform,
            this.device.version,
            this.device.model
          ),
          currentPosition
        );
        patchState({
          currentMeasure: newMeasure,
          currentSeries: MeasureSeries.addMeasureToSeries(currentSeries, updatedMeasure)
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
        seatNumber: currentMeasure.seatNumber
      };
      patchState({
        measureReport: {
          model,
          dirty: false,
          status: '',
          errors: {}
        }
      });
    }
  }

  @Action(StartMeasureSeriesReport)
  StartMeasureSeriesReport({ getState, patchState }: StateContext<MeasuresStateModel>) {
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
                ).toFixed(1)
              )
            : undefined,
        valueAverage: Number(
          (
            currentSeries.measures.reduce((acc, measure) => acc + measure.value, 0) / currentSeries.measures.length
          ).toFixed(3)
        ),
        measurementHeight: currentSeries.measures[0].measurementHeight,
        description: currentSeries.measures[0].description,
        tags: currentSeries.measures[0].tags,
        measurementEnvironment: currentSeries.measures[0].measurementEnvironment,
        rain: currentSeries.measures[0].rain,
        storm: currentSeries.measures[0].storm,
        windowSeat: currentSeries.measures[0].windowSeat,
        flightNumber: currentSeries.measures[0].flightNumber,
        seatNumber: currentSeries.measures[0].seatNumber
      };
      patchState({
        measureSeriesReport: {
          model,
          dirty: false,
          status: '',
          errors: {}
        }
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
        enclosedObject: measureReport.model.enclosedObject
      };
      if (currentMeasure.manualReporting) {
        updatedCurrentMeasure = {
          ...updatedCurrentMeasure,
          temperature: measureReport.model.temperature,
          value: measureReport.model.value!,
          hitsNumber: measureReport.model.hitsNumber
        };
        if (measureReport.model.duration !== undefined) {
          const durationDate = new Date(measureReport.model.duration);
          let hours;
          let minutes;
          let seconds;
          hours = durationDate.getHours();
          minutes = durationDate.getMinutes();
          seconds = durationDate.getSeconds();
          updatedCurrentMeasure = {
            ...updatedCurrentMeasure,
            endTime: currentMeasure.startTime + (hours * 60 * 60 + minutes * 60 + seconds) * 1000
          };
        }
      }
      patchState({
        measureReport: undefined,
        currentMeasure: updatedCurrentMeasure
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
          measures: currentSeries.measures.map(measure => ({
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
              : undefined
          }))
        }
      });
    }
  }

  @Action(PublishMeasure)
  publishMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, { measure }: PublishMeasure) {
    if (!measure.sent) {
      let { measures } = getState();
      const index = measures.findIndex(stateMeasure => stateMeasure.id === measure.id);
      if (index !== -1) {
        return this.measuresService.publishMeasure(measure).pipe(
          tap(() => {
            measures = getState().measures;
            patchState({
              measures: [...measures.slice(0, index), { ...measure, sent: true }, ...measures.slice(index + 1)]
            });
          })
        );
      }
    }
    return of(null);
  }

  @Action(DeleteMeasure)
  deleteMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, { measure }: DeleteMeasure) {
    if (!measure.sent) {
      const { measures } = getState();
      const index = measures.findIndex(stateMeasure => stateMeasure.id === measure.id);
      if (index !== -1) {
        patchState({
          measures: [...measures.slice(0, index), ...measures.slice(index + 1)]
        });
      }
    }
  }

  @Action(DeleteAllMeasures)
  deleteAllMeasures({ patchState }: StateContext<MeasuresStateModel>) {
    patchState({
      measures: []
    });
  }

  @Action(ShowMeasure)
  showMeasure({ patchState }: StateContext<MeasuresStateModel>, { measure }: PublishMeasure) {
    if (measure.type === MeasureType.Measure) {
      patchState({
        currentMeasure: { ...measure }
      });
    } else {
      patchState({
        currentSeries: { ...measure }
      });
    }
  }

  @Action(AddRecentTag)
  addRecentTag({ getState, patchState }: StateContext<MeasuresStateModel>, { tag }: AddRecentTag) {
    const { recentTags } = getState();
    const index = recentTags.indexOf(tag);
    patchState({
      recentTags:
        index === -1 ? [tag, ...recentTags] : [tag, ...recentTags.slice(0, index), ...recentTags.slice(index + 1)]
    });
  }
}
