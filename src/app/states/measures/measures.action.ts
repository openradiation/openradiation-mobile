import { Location } from '@mauron85/cordova-plugin-background-geolocation';
import { AbstractDevice } from '../devices/abstract-device';
import { Measure, MeasureSeries, Params, Step } from './measure';

export class InitMeasures {
  static readonly type = '[Measure] Init';
  constructor(public measures: (Measure | MeasureSeries)[], public params: Params, public recentTags: string[]) {}
}

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

export class EnablePLaneMode {
  static readonly type = '[Measures] Enable plane mode';
}

export class DisablePlaneMode {
  static readonly type = '[Measures] Disable plane mode';
}

export class PositionChanged {
  static readonly type = '[Measures] Position changed';
  constructor(public position?: Location) {}
}

export class StartMeasure {
  static readonly type = '[Measures] Start measure';
  constructor(public device: AbstractDevice) {}
}

export class StopMeasure {
  static readonly type = '[Measures] Stop measure';
}

export class StopMeasureSeries {
  static readonly type = '[Measures] Stop series';
}

export class CancelMeasure {
  static readonly type = '[Measures] Cancel measure';
}

export class StartMeasureSeriesParams {
  static readonly type = '[Measures] Start measure series params';
}

export class StopMeasureSeriesParams {
  static readonly type = '[Measures] Stop measure series params';
}

export class AddMeasureScanStep {
  static readonly type = '[Measures] Add measure scan step';
  constructor(public step: Step, public device: AbstractDevice) {}
}

export class StartMeasureScan {
  static readonly type = '[Measures] Start measure radiation scan';
  constructor(public device: AbstractDevice) {}
}

export class StopMeasureScan {
  static readonly type = '[Measures] Stop measure radiation scan';
  constructor(public device: AbstractDevice) {}
}

export class StartNextMeasureSeries {
  static readonly type = '[Measures] Start next measure series';
  constructor(public device: AbstractDevice) {}
}

export class StartMeasureReport {
  static readonly type = '[Measures] Start measure report';
}

export class StartMeasureSeriesReport {
  static readonly type = '[Measures] Start measure series report';
}

export class StopMeasureReport {
  static readonly type = '[Measures] Stop measure report';
}

export class StartManualMeasure {
  static readonly type = '[Measures] Start manual measure';
}

export class StopMeasureSeriesReport {
  static readonly type = '[Measures] Stop measure series report';
}

export class PublishMeasure {
  static readonly type = '[Measures] Publish measure';
  constructor(public measure: Measure | MeasureSeries) {}
}

export class DeleteMeasure {
  static readonly type = '[Measures] Delete measure';
  constructor(public measure: Measure | MeasureSeries) {}
}

export class DeleteAllMeasures {
  static readonly type = '[Measures] Delete all measures';
}

export class ShowMeasure {
  static readonly type = '[Measures] Show measure detail';
  constructor(public measure: Measure | MeasureSeries) {}
}

export class AddRecentTag {
  static readonly type = '[Measures] Add recent tag';
  constructor(public tag: string) {}
}
