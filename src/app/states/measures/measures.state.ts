import { Device } from '@ionic-native/device/ngx';
import { Geoposition } from '@ionic-native/geolocation';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as uuid from 'uuid';
import { DateService } from './date.service';
import { Measure, MeasureReport } from './measure';
import {
  AddMeasureScanStep,
  CancelMeasure,
  DeleteAllMeasures,
  DeleteMeasure,
  DisableAutoPublish,
  DisableExpertMode,
  EnableAutoPublish,
  EnableExpertMode,
  PositionChanged,
  PublishMeasure,
  StartManualMeasure,
  StartMeasure,
  StartMeasureReport,
  StartMeasureScan,
  StartWatchPosition,
  StopMeasure,
  StopMeasureReport,
  StopMeasureScan,
  StopWatchPosition,
  UpdateMeasureScanTime
} from './measures.action';
import { MeasuresService } from './measures.service';
import { PositionService } from './position.service';

export interface MeasuresStateModel {
  measures: Measure[];
  currentPosition?: Geoposition;
  isWatchingPosition: boolean;
  currentMeasure?: Measure;
  measureReport?: {
    model: MeasureReport;
    dirty: boolean;
    status: string;
    errors: any;
  };
  params: {
    expertMode: boolean;
    autoPublish: boolean;
  };
}

@State<MeasuresStateModel>({
  name: 'measures',
  defaults: {
    measures: [],
    isWatchingPosition: false,
    params: {
      expertMode: false,
      autoPublish: false
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
  static expertMode(state: MeasuresStateModel): boolean {
    return state.params.expertMode;
  }

  @Selector()
  static autoPublish(state: MeasuresStateModel): boolean {
    return state.params.autoPublish;
  }

  @Selector()
  static currentPosition(state: MeasuresStateModel): Geoposition | undefined {
    return state.currentPosition;
  }

  @Selector()
  static positionAccuracy(state: MeasuresStateModel): number {
    return state.currentPosition ? state.currentPosition.coords.accuracy : -1;
  }

  @Selector()
  static isWatchingPosition(state: MeasuresStateModel): boolean {
    return state.isWatchingPosition;
  }

  @Selector()
  static currentMeasure(state: MeasuresStateModel): Measure | undefined {
    return state.currentMeasure;
  }

  @Selector()
  static measures(state: MeasuresStateModel): Measure[] {
    return state.measures;
  }

  @Action(EnableExpertMode)
  enableExpertMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    patchState({
      params: { ...state.params, expertMode: true }
    });
  }

  @Action(DisableExpertMode)
  disableExpertMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    patchState({
      params: { ...state.params, expertMode: false }
    });
  }

  @Action(EnableAutoPublish)
  enableAutoPublish({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    patchState({
      params: { ...state.params, autoPublish: true }
    });
  }

  @Action(DisableAutoPublish)
  disableAutoPublish({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    patchState({
      params: { ...state.params, autoPublish: false }
    });
  }

  @Action(StartWatchPosition)
  startWatchPosition({ patchState }: StateContext<MeasuresStateModel>) {
    return this.positionService.startWatchPosition().pipe(
      tap(position =>
        patchState({
          currentPosition: position,
          isWatchingPosition: true
        })
      )
    );
  }

  @Action(StopWatchPosition)
  stopDiscoverDevices({ patchState }: StateContext<MeasuresStateModel>) {
    patchState({
      isWatchingPosition: false
    });
  }

  @Action(PositionChanged)
  positionChanged({ patchState }: StateContext<MeasuresStateModel>, { position }: PositionChanged) {
    patchState({
      currentPosition: position
    });
  }

  @Action(StartMeasure)
  startMeasure({ patchState }: StateContext<MeasuresStateModel>, { device }: StartMeasure) {
    patchState({
      currentMeasure: new Measure(
        device.apparatusId,
        device.apparatusVersion,
        device.apparatusSensorType,
        device.apparatusTubeType,
        this.device.uuid,
        this.device.platform,
        this.device.version,
        this.device.model,
        uuid.v4()
      )
    });
  }

  @Action(StartManualMeasure)
  startManualMeasure({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    if (state.currentPosition) {
      patchState({
        currentMeasure: {
          ...new Measure(
            undefined,
            undefined,
            undefined,
            undefined,
            this.device.uuid,
            this.device.platform,
            this.device.version,
            this.device.model,
            uuid.v4(),
            true
          ),
          latitude: state.currentPosition!.coords.latitude,
          longitude: state.currentPosition!.coords.longitude,
          accuracy: state.currentPosition!.coords.accuracy,
          endLatitude: state.currentPosition!.coords.latitude,
          endLongitude: state.currentPosition!.coords.longitude,
          endAccuracy: state.currentPosition!.coords.accuracy,
          startTime: Date.now()
        }
      });
    } else {
      patchState({
        currentMeasure: {
          ...new Measure(
            undefined,
            undefined,
            undefined,
            undefined,
            this.device.uuid,
            this.device.platform,
            this.device.version,
            this.device.model,
            uuid.v4(),
            true
          ),
          startTime: Date.now()
        }
      });
    }
  }

  @Action(StopMeasure)
  stopMeasure({ getState, patchState, dispatch }: StateContext<MeasuresStateModel>) {
    const state = getState();
    if (state.currentMeasure) {
      const measure = { ...state.currentMeasure, steps: undefined };
      patchState({
        measures: [...state.measures, measure],
        currentMeasure: undefined
      });
      if (state.params.autoPublish) {
        dispatch(new PublishMeasure(measure));
      }
    }
  }

  @Action(CancelMeasure)
  cancelMeasure({ patchState }: StateContext<MeasuresStateModel>) {
    patchState({
      currentMeasure: undefined,
      measureReport: undefined
    });
  }

  @Action(AddMeasureScanStep)
  addMeasureScanStep({ getState, patchState }: StateContext<MeasuresStateModel>, { step, device }: AddMeasureScanStep) {
    const state = getState();
    if (state.currentMeasure && state.currentMeasure.steps) {
      const currentMeasure = { ...state.currentMeasure, steps: [...state.currentMeasure.steps, step] };
      currentMeasure.endTime = step.ts;
      currentMeasure.hitsNumber += step.hitsNumber;
      currentMeasure.value = this.measuresService.computeRadiationValue(currentMeasure, device);
      currentMeasure.temperature =
        currentMeasure.steps
          .map(currentMeasureStep => currentMeasureStep.temperature)
          .reduce((acc, current) => acc + current) / currentMeasure.steps.length;
      patchState({
        currentMeasure
      });
    }
  }

  @Action(UpdateMeasureScanTime)
  updateMeasureScanTime({ getState, patchState }: StateContext<MeasuresStateModel>, { device }: UpdateMeasureScanTime) {
    const state = getState();
    if (state.currentMeasure) {
      patchState({
        currentMeasure: {
          ...state.currentMeasure,
          endTime: Date.now(),
          value: this.measuresService.computeRadiationValue(state.currentMeasure, device)
        }
      });
    }
  }

  @Action(StartMeasureScan)
  startMeasureScan({ getState, patchState }: StateContext<MeasuresStateModel>, { device }: StartMeasureScan) {
    const state = getState();
    if (state.currentMeasure) {
      if (state.currentPosition) {
        return this.measuresService.startMeasureScan(device).pipe(
          tap(() => {
            patchState({
              currentMeasure: {
                ...state.currentMeasure!,
                startTime: Date.now(),
                endTime: Date.now(),
                latitude: state.currentPosition!.coords.latitude,
                longitude: state.currentPosition!.coords.longitude,
                accuracy: state.currentPosition!.coords.accuracy,
                altitude: state.currentPosition!.coords.altitude,
                altitudeAccuracy: state.currentPosition!.coords.altitudeAccuracy
              }
            });
          })
        );
      } else {
        return this.measuresService.startMeasureScan(device).pipe(
          tap(() => {
            patchState({
              currentMeasure: {
                ...state.currentMeasure!,
                startTime: Date.now(),
                endTime: Date.now()
              }
            });
          })
        );
      }
    } else {
      return of();
    }
  }

  @Action(StopMeasureScan)
  stopMeasureScan({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    if (state.currentMeasure) {
      if (state.currentPosition) {
        patchState({
          currentMeasure: {
            ...state.currentMeasure,
            endLatitude: state.currentPosition.coords.longitude,
            endLongitude: state.currentPosition.coords.latitude,
            endAccuracy: state.currentPosition.coords.accuracy,
            endAltitude: state.currentPosition.coords.altitude,
            endAltitudeAccuracy: state.currentPosition.coords.altitudeAccuracy
          }
        });
      } else {
        patchState({
          currentMeasure: {
            ...state.currentMeasure
          }
        });
      }
    }
  }

  @Action(StartMeasureReport)
  startMeasureReport({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    if (state.currentMeasure) {
      let model: MeasureReport = {
        latitude: undefined,
        longitude: undefined,
        endLatitude: undefined,
        endLongitude: undefined,
        date: this.dateService.toISOString(state.currentMeasure.startTime),
        startTime: this.dateService.toISOString(state.currentMeasure.startTime),
        duration: undefined,
        temperature: undefined,
        hitsNumber: undefined,
        value: undefined,
        measurementHeight: undefined,
        description: undefined,
        tags: undefined,
        measurementEnvironment: undefined,
        rain: undefined
      };
      if (
        state.currentMeasure.latitude &&
        state.currentMeasure.longitude &&
        state.currentMeasure.endLatitude &&
        state.currentMeasure.endLongitude
      ) {
        model = {
          ...model,
          latitude: Number(state.currentMeasure.latitude.toFixed(7)),
          longitude: Number(state.currentMeasure.longitude.toFixed(7)),
          endLatitude: Number(state.currentMeasure.endLatitude.toFixed(7)),
          endLongitude: Number(state.currentMeasure.endLongitude.toFixed(7))
        };
      }
      if (!state.currentMeasure.manualReporting) {
        model = {
          ...model,
          duration: this.dateService.toISODuration(state.currentMeasure.endTime! - state.currentMeasure.startTime),
          temperature: Number(state.currentMeasure.temperature!.toFixed(2)),
          hitsNumber: state.currentMeasure.hitsNumber,
          value: Number(state.currentMeasure.value.toFixed(3))
        };
      }
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

  @Action(StopMeasureReport)
  stopMeasureReport({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    if (state.currentMeasure && state.measureReport) {
      let currentMeasure: Measure = {
        ...state.currentMeasure,
        measurementHeight: state.measureReport.model.measurementHeight!,
        measurementEnvironment: state.measureReport.model.measurementEnvironment!,
        rain: state.measureReport.model.rain!,
        description: state.measureReport.model.description,
        tags: state.measureReport.model.tags
      };
      if (state.currentMeasure.manualReporting) {
        const durationDate = new Date(state.measureReport.model.duration!);
        currentMeasure = {
          ...state.currentMeasure,
          temperature: state.measureReport.model.temperature!,
          value: state.measureReport.model.value!,
          hitsNumber: state.measureReport.model.hitsNumber!,
          endTime: state.currentMeasure.startTime + (durationDate.getMinutes() * 60 + durationDate.getSeconds()) * 1000,
          measurementHeight: state.measureReport.model.measurementHeight!,
          measurementEnvironment: state.measureReport.model.measurementEnvironment!,
          rain: state.measureReport.model.rain!
        };
      }
      patchState({
        measureReport: undefined,
        currentMeasure
      });
    }
  }

  @Action(PublishMeasure)
  publishMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, { measure }: PublishMeasure) {
    if (!measure.sent) {
      const state = getState();
      const index = state.measures.findIndex(stateMeasure => stateMeasure.reportUuid === measure.reportUuid);
      if (index !== -1) {
        return this.measuresService.publishMeasure(measure).pipe(
          tap(() => {
            const measures = [...state.measures];
            measures.splice(index, 1);
            patchState({
              measures: [
                ...state.measures.slice(0, index),
                { ...measure, sent: true },
                ...state.measures.slice(index + 1)
              ]
            });
          })
        );
      }
    }
    return of();
  }

  @Action(DeleteMeasure)
  deleteMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, { measure }: DeleteMeasure) {
    if (!measure.sent) {
      const state = getState();
      const index = state.measures.findIndex(stateMeasure => stateMeasure.reportUuid === measure.reportUuid);
      if (index !== -1) {
        patchState({
          measures: [...state.measures.slice(0, index), ...state.measures.slice(index + 1)]
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
}
