import { Geoposition } from '@ionic-native/geolocation';
import { AbstractDevice } from '../devices/abstract-device';
import { Step } from './measure';

export class EnableExpertMode {
  static readonly type = '[Measures] Enable expert mode';
}

export class DisableExpertMode {
  static readonly type = '[Measure] Disable expert mode';
}

export class EnableAutoPublish {
  static readonly type = '[Measures] Enable auto publish';
}

export class DisableAutoPublish {
  static readonly type = '[Measures] Disable auto publish';
}

export class StartWatchPosition {
  static readonly type = '[Measures] Start watch position';
}

export class StopWatchPosition {
  static readonly type = '[Measures] Stop watch position';
}

export class PositionChanged {
  static readonly type = '[Measures] Position changed';
  constructor(public position: Geoposition) {}
}

export class StartMeasure {
  static readonly type = '[Measures] Start measure';
  constructor(public device: AbstractDevice) {}
}

export class StopMeasure {
  static readonly type = '[Mesures] Stop measure';
}

export class UpdateMeasure {
  static readonly type = '[Measures] Update measure';
  constructor(public step: Step, public device: AbstractDevice) {}
}

export class StartManualMeasure {
  static readonly type = '[Measures] Start manual measure';
}
