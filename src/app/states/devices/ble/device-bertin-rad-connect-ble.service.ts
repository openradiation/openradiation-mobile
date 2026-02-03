import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin, Observable, of, zip, from } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { Measure, MeasureSeriesParamsSelected, Step } from '@app/states/measures/measure';
import { RawBLEDevice } from './abstract-ble-device';
import { AbstractBLEDeviceService } from './abstract-ble-device.service';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { DeviceBertinRadConnectBLE } from './device-bertin-rad-connect-ble';
import {
  ActivateDisconnectedMeasureMode,
  DeviceConnectionLost,
  DisconnectedMeasureSynchronizationProgress,
  DisconnectedMeasureSynchronizationSuccess,
  UpdateDeviceInfo,
} from '../devices.action';
import { AbstractDevice, DeviceType } from '../abstract-device';
import { MeasuresState } from '@app/states/measures/measures.state';

@Injectable({
  providedIn: 'root',
})
export class DeviceBertinRadConnectBLEService extends AbstractBLEDeviceService<DeviceBertinRadConnectBLE> {
  protected calibrationFunctions = {
    planeMode: {
      0: '(0.00000003751 * (cps * 60 - 4) ^ 2 + 0.00965 * (cps * 60 - 4)) * 0.85',
      1.5: 'cps * 1.14',
    },
    groundLevel: {
      0: '(0.00000003751 * (cps * 60 - 4) ^ 2 + 0.00965 * (cps * 60 - 4)) * 0.85',
    },
  };

  protected service = '460AC7FF-78B9-26B2-5943-4F04311FD43C';
  protected sensorIdentificationCharacteristic = '63209D5C-26E0-36B2-9047-675528A8CDFE';
  protected receiveCharacteristic = '2BB349C6-0278-949D-2841-F55C22842E2F';
  private sendCharacteristic = '82ba1887-0815-61a5-be42-6192013fd390';
  private startDisconnectedMeasureCode = 0x01;
  private stopDisconnectedMeasureCode = 0x00;
  private getDisconnectedMeasureCode = 0x13;
  private clearDisconnectedMeasureCode = 0x14;
  private airMeasureCode = 0x01;
  private retrieveInMemoryMeasuresCharacteristic = 'C6F9E64F-08DA-4AB7-974E-229F6CC41D74';

  constructor(protected store: Store) {
    super(store);
  }

  getDeviceInfo(device: DeviceBertinRadConnectBLE): Observable<Partial<DeviceBertinRadConnectBLE>> {
    return forkJoin([
      from(BleClient.read(device.sensorUUID, this.service, this.sensorIdentificationCharacteristic)),
    ]).pipe(
      map(([idDataView]: [DataView]) => {
        const toHex = this.arrayBufferToHex(idDataView.buffer);
        const family = parseInt(toHex.slice(1, 2), 8);
        const variant = parseInt(toHex.slice(2, 3), 8);
        const increment = parseInt(toHex.slice(2, 7), 32);
        const firmwareVersion = family + '.' + variant + '.' + increment.toString().slice(0, 4);
        return {
          apparatusVersion: `${DeviceType.BertinRadConnect} v${firmwareVersion}`,
        };
      }),
    );
  }

  saveDeviceParams(_device: DeviceBertinRadConnectBLE): Observable<unknown> {
    return of(null);
  }

  startMeasureScan(device: DeviceBertinRadConnectBLE, stopSignal: Observable<unknown>): Observable<Step> {
    stopSignal.subscribe(() => {
      this.stopReceiveData(device);
    });
    return zip(this.startReceiveData(device)).pipe(
      map((dataViews: [DataView]) => {
        const decodedDataPackage = this.decodeDataPackage(dataViews);
        device.batteryLevel = decodedDataPackage.voltage;
        this.store.dispatch(new UpdateDeviceInfo(device));
        return decodedDataPackage;
      }),
      catchError((err) => {
        this.disconnectDevice(device).subscribe();
        setTimeout(() => this.store.dispatch(new DeviceConnectionLost()), 1000);
        throw err;
      }),
    );
  }

  protected decodeDataPackage([hitsBuffer]: [DataView]): Step {
    const hitsNumber = hitsBuffer.getUint32(10, true);
    const temperature = hitsBuffer.getFloat32(34, true);
    const voltage = hitsBuffer.getUint8(38);
    const status = hitsBuffer.getUint8(1);
    const recordingActive = (status & 0b00000001) !== 0;
    const hasMeasureInMemory = (status & 0b00000010) !== 0;
    const bleState = (status >> 2) & 0b11;
    const hasError = (status & 0b10000000) !== 0;
    const receiveData = {
      ts: Date.now(),
      hitsNumber: hitsNumber,
      temperature: temperature,
      voltage: voltage,
    };
    this.logAndStore(
      'Received from RadConnectBLE : ' +
      JSON.stringify(receiveData) +
      ' (full status : ' +
      status +
      '/recordingActive:' +
      recordingActive +
      '/hasMemory:' +
      hasMeasureInMemory +
      '/bleState:' +
      bleState +
      '/hasError:' +
      hasError,
    );
    return receiveData;
  }
  buildDevice(rawBLEDevice: RawBLEDevice): DeviceBertinRadConnectBLE | null {
    if (rawBLEDevice.name.includes('RadConnect_GP')) {
      return new DeviceBertinRadConnectBLE(rawBLEDevice);
    }
    return null;
  }

  public canActivateDisconnectedMeasureMode(): boolean {
    return true;
  }

  public async activateDisconnectedMeasureMode(device: AbstractDevice) {
    const dataView = new DataView(new ArrayBuffer(3));
    dataView.setUint8(1, this.clearDisconnectedMeasureCode);
    dataView.setUint8(2, 0);
    await BleClient.write(device.sensorUUID, this.service, this.sendCharacteristic, dataView);
    dataView.setUint8(1, this.startDisconnectedMeasureCode);
    dataView.setUint8(2, this.airMeasureCode);
    try {
      const result = await BleClient.write(device.sensorUUID, this.service, this.sendCharacteristic, dataView);
      this.store.dispatch(new ActivateDisconnectedMeasureMode());
      return result;
    } catch (error) {
      this.logAndStore('Error while activating disconnect mode with bertin radconnect ', error);
      return Promise.reject(error);
    }
  }

  public async synchronizeDisconnectedMeasure(device: AbstractDevice) {
    let timeoutHandle: any;
    try {
      localStorage.setItem('disconnected_measure_hits', '[]');
      // Step 1: get ready to receive disconnected measure
      BleClient.startNotifications(
        device.sensorUUID,
        this.service,
        this.retrieveInMemoryMeasuresCharacteristic,
        (value) => {
          if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
          }
          this.receiveNextDisconnectedMeasurePackage(device, value);
        },
      ).catch((e) => {
        throw e;
      });

      // Step 2: send get disconnected measure signal
      const dataView = new DataView(new ArrayBuffer(3));
      dataView.setUint8(1, this.stopDisconnectedMeasureCode);
      await BleClient.write(device.sensorUUID, this.service, this.sendCharacteristic, dataView);
      dataView.setUint8(1, this.getDisconnectedMeasureCode);
      await BleClient.write(device.sensorUUID, this.service, this.sendCharacteristic, dataView);

      // Step 3: make sure that if no measure is received within 2 secondes, we stop synchronization
      // It happens when sensor remains disconnected for a few seconds only
      timeoutHandle = setTimeout(() => {
        const backgroundMeasures = this.convertBackgroundMeasureToMeasureSeries();
        this.store.dispatch(new DisconnectedMeasureSynchronizationSuccess(backgroundMeasures));
      }, 2000);
    } catch (error) {
      this.logAndStore('Error while synchronizing disconnected measure ', error);
      return Promise.reject(error);
    }
  }

  async receiveNextDisconnectedMeasurePackage(device: AbstractDevice, dataView: DataView) {
    const remainingBlocs = dataView.getUint8(0);
    const measureBlocSize = dataView.getUint32(1, true);

    let values = JSON.parse(localStorage.getItem('disconnected_measure_hits') ?? '[]')
    for (let i = 0; i * 12 < measureBlocSize; i++) {
      const hitsInOneMinute = dataView.getUint32(9 + i * 12, true);
      values.push({ hitsInOneMinute: hitsInOneMinute });
    }
    localStorage.setItem('disconnected_measure_hits', JSON.stringify(values));
    if (remainingBlocs > 0) {
      this.store.dispatch(new DisconnectedMeasureSynchronizationProgress(remainingBlocs));
    } else {
      // Clean measure in memory
      const dataView = new DataView(new ArrayBuffer(3));
      dataView.setUint8(1, this.clearDisconnectedMeasureCode);
      await BleClient.write(device.sensorUUID, this.service, this.sendCharacteristic, dataView);

      // Stop listing
      BleClient.stopNotifications(device.sensorUUID, this.service, this.retrieveInMemoryMeasuresCharacteristic);

      // Convert background measures to measures array
      const backgroundMeasures = this.convertBackgroundMeasureToMeasureSeries();

      // Send success signal
      this.store.dispatch(new DisconnectedMeasureSynchronizationSuccess(backgroundMeasures));
    }
  }


  convertBackgroundMeasureToMeasureSeries(): Measure[] {
    let measureSeries = this.store.selectSnapshot(MeasuresState.currentSeries);
    if (!measureSeries) {
      measureSeries = JSON.parse(localStorage.getItem('disconnected_measure_series') ?? "{}")
    }
    let disconnectedMeasureHitsString = localStorage.getItem('disconnected_measure_hits') ?? "";
    if ((disconnectedMeasureHitsString?.length ?? 0) < 4) {
      throw new Error("Could not retrieve backgroud measure ")
    }
    const backgroundMeasuresPerMinutes = JSON.parse(disconnectedMeasureHitsString)
    if (!measureSeries || measureSeries.measures.length == 0) {
      throw new Error("Could not retrieve backgroud measure (empty measure series)")
    }
    let convertedMeasures: Measure[] = []
    const referenceMeasure = measureSeries.measures[measureSeries.measures.length - 1]
    const minMeasureDurationMinutes = measureSeries.params.paramSelected === MeasureSeriesParamsSelected.measureDurationLimit
      ? (measureSeries.params.measureDurationLimit / 60_000) : Number.POSITIVE_INFINITY;
    const minMeasureHitCount = measureSeries.params.paramSelected === MeasureSeriesParamsSelected.measureHitsLimit
      ? measureSeries.params.measureHitsLimit : Number.POSITIVE_INFINITY;
    var currentTimeStamp = referenceMeasure.endTime ?? referenceMeasure.startTime
    let currentMeasureDurationInMinutes = 0;
    let currentMeasureHitsCount = 0;
    for (let backroundMeasure of backgroundMeasuresPerMinutes) {
      currentMeasureDurationInMinutes++;
      currentMeasureHitsCount += backroundMeasure.hitsInOneMinute
      if (currentMeasureDurationInMinutes >= minMeasureDurationMinutes
        || currentMeasureHitsCount >= minMeasureHitCount
      ) {
        const reconstructedMeasure: Measure = JSON.parse(JSON.stringify(referenceMeasure))
        reconstructedMeasure.hitsNumber = currentMeasureHitsCount;
        reconstructedMeasure.startTime = currentTimeStamp;
        currentTimeStamp += 60_000 * currentMeasureDurationInMinutes
        reconstructedMeasure.endTime = currentTimeStamp - 1000
        const [value, calibrationFunction] = this.computeRadiationValue(reconstructedMeasure, true)
        reconstructedMeasure.hitsAccuracy = reconstructedMeasure.hitsNumber;
        reconstructedMeasure.value = value;
        reconstructedMeasure.calibrationFunction = calibrationFunction;
        convertedMeasures.push(reconstructedMeasure);
        currentMeasureDurationInMinutes = 0
        currentMeasureHitsCount = 0
      }
    }
    // Append to last measure
    if (convertedMeasures.length > 0 && currentMeasureDurationInMinutes > 0 && currentMeasureHitsCount > 0) {
      const lastMeasure: Measure = JSON.parse(JSON.stringify(convertedMeasures[convertedMeasures.length - 1]))
      lastMeasure.hitsNumber = lastMeasure.hitsNumber! + currentMeasureHitsCount;
      lastMeasure.endTime = lastMeasure.endTime! + 60_000 * currentMeasureDurationInMinutes;
      const [value] = this.computeRadiationValue(lastMeasure, true)
      lastMeasure.hitsAccuracy = lastMeasure.hitsNumber;
      lastMeasure.value = value;
      convertedMeasures[convertedMeasures.length - 1] = lastMeasure
    }
    return convertedMeasures;
  }
}
