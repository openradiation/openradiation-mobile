import { Measure } from './measure';
import { State } from '@ngxs/store';

export interface MeasuresStateModel {
  measures: Measure[];
  currentMeasure?: Measure;
}

@State<MeasuresStateModel>({
  name: 'measures',
  defaults: {
    measures: []
  }
})
export class MeasuresState {}
