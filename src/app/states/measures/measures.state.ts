import { State } from '@ngxs/store';
import { Measure } from './measure';

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
