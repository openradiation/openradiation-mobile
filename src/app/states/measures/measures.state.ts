import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Measure } from './measure';
import { DisableAutoPublish, DisableExpertMode, EnableAutoPublish, EnableExpertMode } from './measures.action';

export interface MeasuresStateModel {
  measures: Measure[];
  currentMeasure?: Measure;
  expertMode: boolean;
  autoPublish: boolean;
}

@State<MeasuresStateModel>({
  name: 'measures',
  defaults: {
    measures: [],
    expertMode: false,
    autoPublish: false
  }
})
export class MeasuresState {
  @Selector()
  static expertMode(state: MeasuresStateModel): boolean {
    return state.expertMode;
  }

  @Selector()
  static autoPublish(state: MeasuresStateModel): boolean {
    return state.autoPublish;
  }

  @Action(EnableExpertMode)
  enableExpertMode({ patchState }: StateContext<MeasuresStateModel>) {
    patchState({
      expertMode: true
    });
  }

  @Action(DisableExpertMode)
  disableExpertMode({ patchState }: StateContext<MeasuresStateModel>) {
    patchState({
      expertMode: false
    });
  }

  @Action(EnableAutoPublish)
  enableAutoPublish({ patchState }: StateContext<MeasuresStateModel>) {
    patchState({
      autoPublish: true
    });
  }

  @Action(DisableAutoPublish)
  disableAutoPublish({ patchState }: StateContext<MeasuresStateModel>) {
    patchState({
      autoPublish: false
    });
  }
}
