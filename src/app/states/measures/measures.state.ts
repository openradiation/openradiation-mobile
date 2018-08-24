import { Device } from '@ionic-native/device/ngx';
import { Geoposition } from '@ionic-native/geolocation';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { Measure } from './measure';
import { MeasuresService } from './measure.service';
import {
  DisableAutoPublish,
  DisableExpertMode,
  EnableAutoPublish,
  EnableExpertMode,
  PositionChanged,
  StartManualMeasure,
  StartMeasure,
  StartMeasureScan,
  StartWatchPosition,
  StopMeasure,
  StopMeasureScan,
  StopWatchPosition,
  UpdateMeasure
} from './measures.action';
import { PositionService } from './position.service';
import { of } from 'rxjs';

export interface MeasuresStateModel {
  measures: Measure[];
  currentMeasure?: Measure;
  currentPosition?: Geoposition;
  isWatchingPosition: boolean;
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
    private measuresService: MeasuresService
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
  startMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, action: StartMeasure) {
    const state = getState();
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
}
