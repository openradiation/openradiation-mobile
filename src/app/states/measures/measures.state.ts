import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Measure } from './measure';
import { DisableAutoPublish, DisableExpertMode, EnableAutoPublish, EnableExpertMode } from './measures.action';

export interface MeasuresStateModel {
  measures: Measure[];
  currentMeasure?: Measure;
  params: {
    expertMode: boolean;
    autoPublish: boolean;
  };
}

@State<MeasuresStateModel>({
  name: 'measures',
  defaults: {
    measures: [],
    params: {
      expertMode: false,
      autoPublish: false
    }
  }
})
export class MeasuresState {
  @Selector()
  static expertMode(state: MeasuresStateModel): boolean {
    return state.params.expertMode;
  }

  @Selector()
  static autoPublish(state: MeasuresStateModel): boolean {
    return state.params.autoPublish;
  }

  @Action(EnableExpertMode)
  enableExpertMode({ patchState, getState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    patchState({
      params: { ...state.params, expertMode: true }
    });
  }

  @Action(DisableExpertMode)
  disableExpertMode({ patchState, getState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    patchState({
      params: { ...state.params, expertMode: false }
    });
  }

  @Action(EnableAutoPublish)
  enableAutoPublish({ patchState, getState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    patchState({
      params: { ...state.params, autoPublish: true }
    });
  }

  @Action(DisableAutoPublish)
  disableAutoPublish({ patchState, getState }: StateContext<MeasuresStateModel>) {
    const state = getState();
    patchState({
      params: { ...state.params, autoPublish: false }
    });
  }
}
