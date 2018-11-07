import { Device } from '@ionic-native/device/ngx';
import { Geoposition } from '@ionic-native/geolocation';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as uuid from 'uuid';
import { DateService } from './date.service';
import { Measure, MeasureReport, PositionAccuracyThreshold } from './measure';
import {
  AddMeasureScanStep,
  CancelMeasure,
  DeleteAllMeasures,
  DeleteMeasure,
  DisableAutoPublish,
  DisableExpertMode,
  EnableAutoPublish,
  EnableExpertMode,
  PositionChanged,
  PublishMeasure,
  ShowMeasure,
  StartManualMeasure,
  StartMeasure,
  StartMeasureReport,
  StartMeasureScan,
  StartWatchPosition,
  StopMeasure,
  StopMeasureReport,
  StopMeasureScan,
  StopWatchPosition,
  UpdateMeasureScanTime
} from './measures.action';
import { MeasuresService } from './measures.service';
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
  static expertMode({ params }: MeasuresStateModel): boolean {
    return params.expertMode;
  }

  @Selector()
  static autoPublish({ params }: MeasuresStateModel): boolean {
    return params.autoPublish;
  }

  @Selector()
  static currentPosition({ currentPosition }: MeasuresStateModel): Geoposition | undefined {
    return currentPosition;
  }

  @Selector()
  static positionAccuracy({ currentPosition }: MeasuresStateModel): number {
    return currentPosition ? currentPosition.coords.accuracy : PositionAccuracyThreshold.No;
  }

  @Selector()
  static isWatchingPosition({ isWatchingPosition }: MeasuresStateModel): boolean {
    return isWatchingPosition;
  }

  @Selector()
  static currentMeasure({ currentMeasure }: MeasuresStateModel): Measure | undefined {
    return currentMeasure;
  }

  @Selector()
  static measures({ measures }: MeasuresStateModel): Measure[] {
    return measures;
  }

  @Action(EnableExpertMode)
  enableExpertMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, expertMode: true }
    });
  }

  @Action(DisableExpertMode)
  disableExpertMode({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, expertMode: false }
    });
  }

  @Action(EnableAutoPublish)
  enableAutoPublish({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, autoPublish: true }
    });
  }

  @Action(DisableAutoPublish)
  disableAutoPublish({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { params } = getState();
    patchState({
      params: { ...params, autoPublish: false }
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
  positionChanged({ patchState }: StateContext<MeasuresStateModel>, { position }: PositionChanged) {
    patchState({
      currentPosition: position
    });
  }

  @Action(StartMeasure)
  startMeasure({ patchState }: StateContext<MeasuresStateModel>, { device }: StartMeasure) {
    patchState({
      currentMeasure: new Measure(
        device.apparatusId,
        device.apparatusVersion,
        device.apparatusSensorType,
        device.apparatusTubeType,
        this.device.uuid,
        this.device.platform,
        this.device.version,
        this.device.model,
        uuid.v4()
      )
    });
  }

  @Action(StartManualMeasure)
  startManualMeasure({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { currentPosition } = getState();
    if (currentPosition) {
      patchState({
        currentMeasure: {
          ...new Measure(
            undefined,
            undefined,
            undefined,
            undefined,
            this.device.uuid,
            this.device.platform,
            this.device.version,
            this.device.model,
            uuid.v4(),
            true
          ),
          latitude: currentPosition!.coords.latitude,
          longitude: currentPosition!.coords.longitude,
          accuracy: currentPosition!.coords.accuracy,
          endLatitude: currentPosition!.coords.latitude,
          endLongitude: currentPosition!.coords.longitude,
          endAccuracy: currentPosition!.coords.accuracy,
          startTime: Date.now()
        }
      });
    } else {
      patchState({
        currentMeasure: {
          ...new Measure(
            undefined,
            undefined,
            undefined,
            undefined,
            this.device.uuid,
            this.device.platform,
            this.device.version,
            this.device.model,
            uuid.v4(),
            true
          ),
          startTime: Date.now()
        }
      });
    }
  }

  @Action(StopMeasure)
  stopMeasure({ getState, patchState, dispatch }: StateContext<MeasuresStateModel>) {
    const { currentMeasure, measures, params } = getState();
    if (currentMeasure) {
      const patch: Partial<MeasuresStateModel> = { currentMeasure: undefined };
      if (currentMeasure.sent) {
        patchState(patch);
      } else {
        const measure = { ...currentMeasure, steps: undefined };
        const measureIndex = measures.findIndex(
          historyMeasure => historyMeasure.reportUuid === currentMeasure.reportUuid
        );
        if (measureIndex > -1) {
          patch.measures = [...measures.slice(0, measureIndex), measure, ...measures.slice(measureIndex + 1)];
        } else {
          patch.measures = [...measures, measure];
        }
        patchState(patch);
        if (
          params.autoPublish &&
          measure.accuracy &&
          measure.accuracy < PositionAccuracyThreshold.Inaccurate &&
          measure.endAccuracy &&
          measure.endAccuracy < PositionAccuracyThreshold.Inaccurate
        ) {
          dispatch(new PublishMeasure(measure));
        }
      }
    }
  }

  @Action(CancelMeasure)
  cancelMeasure({ patchState }: StateContext<MeasuresStateModel>) {
    patchState({
      currentMeasure: undefined,
      measureReport: undefined
    });
  }

  @Action(AddMeasureScanStep)
  addMeasureScanStep({ getState, patchState }: StateContext<MeasuresStateModel>, { step, device }: AddMeasureScanStep) {
    const { currentMeasure } = getState();
    if (currentMeasure && currentMeasure.steps) {
      const newCurrentMeasure = { ...currentMeasure, steps: [...currentMeasure.steps, step] };
      newCurrentMeasure.endTime = step.ts;
      newCurrentMeasure.hitsNumber += step.hitsNumber;
      newCurrentMeasure.value = this.measuresService.computeRadiationValue(newCurrentMeasure, device);
      if (newCurrentMeasure.steps[0] && newCurrentMeasure.steps[0].temperature !== undefined) {
        newCurrentMeasure.temperature =
          newCurrentMeasure.steps
            .map(currentMeasureStep => currentMeasureStep.temperature!)
            .reduce((acc, current) => acc + current) / newCurrentMeasure.steps.length;
      }
      patchState({
        currentMeasure: newCurrentMeasure
      });
    }
  }

  @Action(UpdateMeasureScanTime)
  updateMeasureScanTime({ getState, patchState }: StateContext<MeasuresStateModel>, { device }: UpdateMeasureScanTime) {
    const { currentMeasure } = getState();
    if (currentMeasure) {
      patchState({
        currentMeasure: {
          ...currentMeasure,
          endTime: Date.now(),
          value: this.measuresService.computeRadiationValue(currentMeasure, device)
        }
      });
    }
  }

  @Action(StartMeasureScan)
  startMeasureScan({ getState, patchState }: StateContext<MeasuresStateModel>, { device }: StartMeasureScan) {
    const { currentMeasure, currentPosition } = getState();
    if (currentMeasure) {
      if (currentPosition) {
        return this.measuresService.startMeasureScan(device).pipe(
          tap(() => {
            patchState({
              currentMeasure: {
                ...currentMeasure!,
                startTime: Date.now(),
                endTime: Date.now(),
                latitude: currentPosition!.coords.latitude,
                longitude: currentPosition!.coords.longitude,
                accuracy: currentPosition!.coords.accuracy,
                altitude: currentPosition!.coords.altitude,
                altitudeAccuracy: currentPosition!.coords.altitudeAccuracy
              }
            });
          })
        );
      } else {
        return this.measuresService.startMeasureScan(device).pipe(
          tap(() => {
            patchState({
              currentMeasure: {
                ...currentMeasure!,
                startTime: Date.now(),
                endTime: Date.now()
              }
            });
          })
        );
      }
    } else {
      return of();
    }
  }

  @Action(StopMeasureScan)
  stopMeasureScan({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { currentMeasure, currentPosition } = getState();
    if (currentMeasure) {
      if (currentMeasure.accuracy && currentMeasure.accuracy < PositionAccuracyThreshold.Inaccurate) {
        patchState({
          currentMeasure: {
            ...currentMeasure,
            endLatitude: currentPosition!.coords.latitude,
            endLongitude: currentPosition!.coords.longitude,
            endAccuracy: currentPosition!.coords.accuracy,
            endAltitude: currentPosition!.coords.altitude,
            endAltitudeAccuracy: currentPosition!.coords.altitudeAccuracy
          }
        });
      } else {
        patchState({
          currentMeasure: {
            ...currentMeasure
          }
        });
      }
    }
  }

  @Action(StartMeasureReport)
  startMeasureReport({ getState, patchState }: StateContext<MeasuresStateModel>) {
    const { currentMeasure } = getState();
    if (currentMeasure) {
      const model: MeasureReport = {
        latitude: currentMeasure.latitude ? Number(currentMeasure.latitude.toFixed(7)) : undefined,
        longitude: currentMeasure.longitude ? Number(currentMeasure.longitude.toFixed(7)) : undefined,
        endLatitude: currentMeasure.endLatitude ? Number(currentMeasure.endLatitude.toFixed(7)) : undefined,
        endLongitude: currentMeasure.endLongitude ? Number(currentMeasure.endLongitude.toFixed(7)) : undefined,
        date: this.dateService.toISOString(currentMeasure.startTime),
        startTime: this.dateService.toISOString(currentMeasure.startTime),
        duration: currentMeasure.endTime
          ? this.dateService.toISODuration(currentMeasure.endTime - currentMeasure.startTime)
          : undefined,
        temperature:
          currentMeasure.temperature !== undefined ? Number(currentMeasure.temperature!.toFixed(2)) : undefined,
        hitsNumber: currentMeasure.hitsNumber !== undefined ? currentMeasure.hitsNumber : undefined,
        value: currentMeasure.value !== undefined ? Number(currentMeasure.value.toFixed(3)) : undefined,
        measurementHeight:
          currentMeasure.measurementHeight !== undefined ? currentMeasure.measurementHeight : undefined,
        description: currentMeasure.description !== undefined ? currentMeasure.description : undefined,
        tags: currentMeasure.tags ? currentMeasure.tags : undefined,
        measurementEnvironment: currentMeasure.measurementEnvironment
          ? currentMeasure.measurementEnvironment
          : undefined,
        rain: currentMeasure.rain !== undefined ? currentMeasure.rain : undefined,
        enclosedObject: currentMeasure.enclosedObject !== undefined ? currentMeasure.enclosedObject : undefined
      };
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
    const { currentMeasure, measureReport } = getState();
    if (currentMeasure && measureReport) {
      let currentMeasure_: Measure = {
        ...currentMeasure,
        measurementHeight: measureReport.model.measurementHeight!,
        measurementEnvironment: measureReport.model.measurementEnvironment!,
        rain: measureReport.model.rain!,
        description: measureReport.model.description,
        tags: measureReport.model.tags,
        enclosedObject: measureReport.model.enclosedObject
      };
      if (currentMeasure.manualReporting) {
        const durationDate = new Date(measureReport.model.duration!);
        currentMeasure_ = {
          ...currentMeasure_,
          temperature: measureReport.model.temperature!,
          value: measureReport.model.value!,
          hitsNumber: measureReport.model.hitsNumber!,
          endTime:
            currentMeasure.startTime +
            (durationDate.getHours() * 60 * 60 + durationDate.getMinutes() * 60 + durationDate.getSeconds()) * 1000,
          measurementHeight: measureReport.model.measurementHeight!,
          measurementEnvironment: measureReport.model.measurementEnvironment!,
          rain: measureReport.model.rain!
        };
      }
      patchState({
        measureReport: undefined,
        currentMeasure: currentMeasure_
      });
    }
  }

  @Action(PublishMeasure)
  publishMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, { measure }: PublishMeasure) {
    if (!measure.sent) {
      const { measures } = getState();
      const index = measures.findIndex(stateMeasure => stateMeasure.reportUuid === measure.reportUuid);
      if (index !== -1) {
        return this.measuresService.publishMeasure(measure).pipe(
          tap(() => {
            const measures_ = [...measures];
            measures_.splice(index, 1);
            patchState({
              measures: [...measures.slice(0, index), { ...measure, sent: true }, ...measures.slice(index + 1)]
            });
          })
        );
      }
    }
    return of();
  }

  @Action(DeleteMeasure)
  deleteMeasure({ getState, patchState }: StateContext<MeasuresStateModel>, { measure }: DeleteMeasure) {
    if (!measure.sent) {
      const { measures } = getState();
      const index = measures.findIndex(stateMeasure => stateMeasure.reportUuid === measure.reportUuid);
      if (index !== -1) {
        patchState({
          measures: [...measures.slice(0, index), ...measures.slice(index + 1)]
        });
      }
    }
  }

  @Action(DeleteAllMeasures)
  deleteAllMeasures({ patchState }: StateContext<MeasuresStateModel>) {
    patchState({
      measures: []
    });
  }

  @Action(ShowMeasure)
  showMeasure({ patchState }: StateContext<MeasuresStateModel>, { measure }: PublishMeasure) {
    patchState({
      currentMeasure: { ...measure }
    });
  }
}
