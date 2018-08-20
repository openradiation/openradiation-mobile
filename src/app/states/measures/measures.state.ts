import { Geoposition } from '@ionic-native/geolocation';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { Measure, POSITION_ACCURACY_THRESHOLD, PositionAccuracy } from './measure';
import {
  DisableAutoPublish,
  DisableExpertMode,
  EnableAutoPublish,
  EnableExpertMode,
  PositionChanged,
  StartManualMeasure,
  StartMeasure,
  StartWatchPosition,
  StopWatchPosition
} from './measures.action';
import { PositionService } from './position.service';
import { Device } from '@ionic-native/device/ngx';

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
  constructor(private measuresService: PositionService, private device: Device) {}

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
  static positionAccuracy(state: MeasuresStateModel): PositionAccuracy {
    if (state.currentPosition) {
      return state.currentPosition.coords.accuracy < POSITION_ACCURACY_THRESHOLD
        ? PositionAccuracy.Good
        : PositionAccuracy.Bad;
    } else {
      return PositionAccuracy.Error;
    }
  }

  @Selector()
  static isWatchingPosition(state: MeasuresStateModel): boolean {
    return state.isWatchingPosition;
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
    return this.measuresService.startWatchPosition().pipe(
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
    if (state.currentPosition) {
      patchState({
        currentMeasure: new Measure(
          state.currentPosition,
          action.device.sensorUUID,
          action.device.apparatusId,
          action.device.apparatusVersion,
          action.device.apparatusSensorType,
          action.device.apparatusTubeType,
          '',
          this.device.uuid,
          this.device.platform,
          this.device.version,
          this.device.model,
          Date.now()
        )
      });
    }
  }

  @Action(StartManualMeasure)
  startManualMeasure({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    if (state.currentPosition) {
      patchState({
        currentMeasure: new Measure(
          state.currentPosition,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          '',
          this.device.uuid,
          this.device.platform,
          this.device.version,
          this.device.model,
          Date.now(),
          true
        )
      });
    }
  }
}
