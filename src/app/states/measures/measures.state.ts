import { Device } from '@ionic-native/device/ngx';
import { Geoposition } from '@ionic-native/geolocation';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DateService } from './date.service';
import { Measure, MeasureReport } from './measure';
import { MeasuresService } from './measures.service';
import {
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
  UpdateMeasure
} from './measures.action';
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
  positionChanged({ patchState }: StateContext<MeasuresStateModel>, action: PositionChanged) {
    patchState({
      currentPosition: action.position
    });
  }

  @Action(StartMeasure)
  startMeasure({ patchState }: StateContext<MeasuresStateModel>, action: StartMeasure) {
    patchState({
      currentMeasure: new Measure(
        action.device.apparatusId,
        action.device.apparatusVersion,
        action.device.apparatusSensorType,
        action.device.apparatusTubeType,
        this.device.uuid,
        this.device.platform,
        this.device.version,
        this.device.model,
        ''
      )
    });
  }

  @Action(StartManualMeasure)
  startManualMeasure({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    if (state.currentPosition) {
      patchState({
        currentMeasure: new Measure(
          undefined,
          undefined,
          undefined,
          undefined,
          this.device.uuid,
          this.device.platform,
          this.device.version,
          this.device.model,
          '',
          true
        )
      });
    }
  }

  @Action(StopMeasure)
  stopMeasure({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    if (state.currentMeasure) {
      patchState({
        measures: [...state.measures, { ...state.currentMeasure, steps: undefined }],
        currentMeasure: undefined
      });
    }
  }

  @Action(UpdateMeasure)
  updateMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, action: UpdateMeasure) {
    const state = getState();
    if (state.currentMeasure && state.currentMeasure.steps) {
      const currentMeasure = { ...state.currentMeasure, steps: [...state.currentMeasure.steps, action.step] };
      currentMeasure.endTime = action.step.ts;
      currentMeasure.hitsNumber += action.step.hitsNumber;
      currentMeasure.value = this.measuresService.computeRadiationValue(currentMeasure, action.device);
      currentMeasure.temperature =
        currentMeasure.steps.map(step => step.temperature).reduce((acc, current) => acc + current) /
        currentMeasure.steps.length;
      patchState({
        currentMeasure
      });
    }
  }

  @Action(StartMeasureScan)
  startMeasureScan({ getState, patchState }: StateContext<MeasuresStateModel>, action: StartMeasureScan) {
    const state = getState();
    if (state.currentMeasure && state.currentPosition) {
      return this.measuresService.startMeasureScan(action.device).pipe(
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
      return of();
    }
  }

  @Action(StopMeasureScan)
  stopMeasureScan({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    if (state.currentMeasure && state.currentPosition) {
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
    }
  }

  @Action(StartMeasureReport)
  startMeasureReport({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    if (state.currentMeasure) {
      let model: MeasureReport;
      if (state.currentMeasure.manualReporting) {
        model = {
          latitude: state.currentPosition!.coords.latitude,
          longitude: state.currentPosition!.coords.longitude,
          endLatitude: state.currentPosition!.coords.latitude,
          endLongitude: state.currentPosition!.coords.longitude,
          date: this.dateService.toISOString(new Date()),
          startTime: this.dateService.toISOString(new Date()),
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
      } else {
        model = {
          latitude: state.currentMeasure.latitude,
          longitude: state.currentMeasure.longitude,
          endLatitude: state.currentMeasure.endLatitude,
          endLongitude: state.currentMeasure.endLongitude,
          date: this.dateService.toISOString(state.currentMeasure.startTime),
          startTime: this.dateService.toISOString(state.currentMeasure.startTime),
          duration: this.dateService.toISODuration(state.currentMeasure.endTime - state.currentMeasure.startTime),
          temperature: state.currentMeasure.temperature,
          hitsNumber: state.currentMeasure.hitsNumber,
          value: Number(state.currentMeasure.value.toFixed(3)),
          measurementHeight: undefined,
          description: undefined,
          tags: undefined,
          measurementEnvironment: undefined,
          rain: undefined
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
      let currentMeasure: Measure;
      if (state.currentMeasure.manualReporting) {
        const startTime = new Date(state.measureReport.model.startTime!).getTime();
        const durationDate = new Date(state.measureReport.model.duration!);
        currentMeasure = {
          ...state.currentMeasure,
          temperature: state.measureReport.model.temperature!,
          value: state.measureReport.model.value!,
          hitsNumber: state.measureReport.model.hitsNumber!,
          startTime,
          endTime: startTime + (durationDate.getMinutes() * 60 + durationDate.getSeconds()) * 1000,
          latitude: state.measureReport.model.latitude!,
          longitude: state.measureReport.model.longitude!,
          endLatitude: state.measureReport.model.endLatitude!,
          endLongitude: state.measureReport.model.endLongitude!,
          measurementHeight: state.measureReport.model.measurementHeight!,
          measurementEnvironment: state.measureReport.model.measurementEnvironment!,
          rain: state.measureReport.model.rain!
        };
      } else {
        currentMeasure = {
          ...state.currentMeasure,
          measurementHeight: state.measureReport.model.measurementHeight!,
          measurementEnvironment: state.measureReport.model.measurementEnvironment!,
          rain: state.measureReport.model.rain!
        };
      }
      if (state.measureReport.model.description) {
        currentMeasure = {
          ...currentMeasure,
          description: state.measureReport.model.description
        };
      }
      if (state.measureReport.model.tags) {
        currentMeasure = {
          ...currentMeasure,
          tags: state.measureReport.model.tags
        };
      }
      patchState({
        measureReport: undefined,
        currentMeasure
      });
    }
  }

  @Action(DeleteMeasure)
  deleteMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, action: DeleteMeasure) {
    if (!action.measure.sent) {
      const state = getState();
      const index = state.measures.findIndex(measure => measure.reportUuid === action.measure.reportUuid);
      if (index !== -1) {
        patchState({
          measures: [...state.measures.slice(0, Math.max(0, index - 1)), ...state.measures.slice(index + 1)]
        });
      }
    }
  }

  @Action(PublishMeasure)
  publishMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, action: DeleteMeasure) {
    if (!action.measure.sent) {
      const state = getState();
      const index = state.measures.findIndex(measure => measure.reportUuid === action.measure.reportUuid);
      if (index !== -1) {
        return this.measuresService.publishMeasure(action.measure).pipe(
          tap(() => {
            const measures = [...state.measures];
            measures.splice(index, 1);
            patchState({
              measures: [
                ...state.measures.slice(0, Math.max(0, index - 1)),
                { ...action.measure, sent: true },
                ...state.measures.slice(index + 1)
              ]
            });
          })
        );
      }
    }
    return of();
  }
}
