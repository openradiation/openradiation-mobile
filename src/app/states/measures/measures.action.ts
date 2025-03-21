import { Location } from '@capacitor-community/background-geolocation';
import { AbstractDevice } from '@app/states/devices/abstract-device';
import { AbstractMeasure, Measure, MeasureSeries, Params, Step } from '@app/states/measures/measure';

export class InitMeasures {
  static readonly type = '[Measure] Init';
  constructor(
    public measures: (Measure | MeasureSeries)[],
    public params: Params,
    public recentTags: string[],
    public currentSeries?: MeasureSeries,
  ) {}
}

export class StartBackgroundMeasure {
  static readonly type = '[Measures] Starts a background measure';
  constructor(public device: AbstractDevice) {}
}

export class StopBackgroundMeasure {
  static readonly type = '[Measures] Stops a background measure';
  constructor(public device: AbstractDevice) {}
}

export class EnableExpertMode {
  static readonly type = '[Measures] Enable expert mode';
}

export class DisableExpertMode {
  static readonly type = '[Measure] Disable expert mode';
}

export class EnableFakeHitsMode {
  static readonly type = '[Measures] Enable fake hits mode';
}

export class DisableFakeHitsMode {
  static readonly type = '[Measure] Disable fake hits mode';
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
  constructor(
    public step: Step,
    public device: AbstractDevice,
  ) {}
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

export class PublishMeasureError {
  static readonly type = '[Measures] Publish measure error';
  constructor(public measure: AbstractMeasure) {}
}

export class PublishMeasureSuccess {
  static readonly type = '[Measures] Publish measure success';
  constructor(public measure: AbstractMeasure) {}
}

export class PublishMeasureProgress {
  static readonly type = '[Measures] Publish measure progress';
  constructor(public measure: AbstractMeasure) {}
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
export class FlightNumberValidation {
  static readonly type = '[Measures] Flight Number validation';
  constructor(public isValid: boolean) {}
}

export class UpdateBackgroundMeasureThreshold {
  static readonly type = '[Measures] Update Background Measure Threshold Parameter';
  constructor(public value: number) {}
}

export class UpdateBackgroundMeasureServerURL {
  static readonly type = '[Measures] Update Background Measure URL Parameter';
  constructor(public value: string) {}
}
export class UpdateBackgroundMeasureStepDuration {
  static readonly type = '[Measures] Update Background Measure Step Duration Parameter';
  constructor(public value: number) {}
}
export class UpdateBackgroundMeasureStepCount {
  static readonly type = '[Measures] Update Background Measure StepCount Parameter';
  constructor(public value: number) {}
}
