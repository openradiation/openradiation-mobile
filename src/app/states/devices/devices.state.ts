import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { concatMap, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Form } from '@app/states/formModel';
import { AbstractDevice } from './abstract-device';
import { AbstractBLEDevice } from './ble/abstract-ble-device';
import { BLEDevicesService } from './ble/ble-devices.service';
import { DeviceMock } from './device-mock';
import { DeviceParams } from './device-params';
import {
  ActivateDisconnectedMeasureMode,
  BLEConnectionLost,
  BLEDevicesDiscovered,
  ConnectDevice,
  DeactivateDisconnectedMeasureMode,
  DeviceConnectionLost,
  DisconnectDevice,
  DisconnectedMeasureSynchronizationSuccess,
  EditDeviceParams,
  InitDevices,
  SaveDeviceParams,
  StartDiscoverBLEDevices,
  StartDiscoverUSBDevices,
  StopDiscoverDevices,
  UpdateDevice,
  UpdateDeviceInfo,
  USBDevicesDiscovered,
} from './devices.action';
import { DevicesService } from './devices.service';
import { AbstractUSBDevice } from './usb/abstract-usb-device';
import { USBDevicesService } from './usb/usb-devices.service';
import { MeasuresState } from '../measures/measures.state';
import { MergeDisconnectedMeasuresIntoCurrentSeries, StopMeasureScan } from '../measures/measures.action';

export interface DevicesStateModel {
  isScanning: boolean;
  availableBLEDevices: AbstractBLEDevice[];
  availableUSBDevices: AbstractUSBDevice[];
  knownDevices: AbstractDevice[];
  connectedDevice?: AbstractDevice;
  deviceInDisconnectedMeasureMode?: AbstractDevice;
  editedDevice?: AbstractDevice;
  editedDeviceForm?: Form<DeviceParams>;
}

@State<DevicesStateModel>({
  name: 'devices',
  defaults: {
    isScanning: false,
    availableBLEDevices: [],
    availableUSBDevices: [],
    knownDevices: [],
  },
})
@Injectable()
export class DevicesState {
  constructor(
    private devicesService: DevicesService,
    private bleDevicesService: BLEDevicesService,
    private usbDevicesService: USBDevicesService,
    protected store: Store,
  ) { }

  @Selector()
  static availableDevices({
    availableBLEDevices,
    availableUSBDevices,
    connectedDevice,
  }: DevicesStateModel): AbstractDevice[] {
    return [...availableBLEDevices, ...availableUSBDevices].filter(
      (availableDevice) => connectedDevice === undefined || connectedDevice.sensorUUID !== availableDevice.sensorUUID,
    );
  }

  @Selector()
  static knownDevices({
    knownDevices,
    availableBLEDevices,
    availableUSBDevices,
    connectedDevice,
  }: DevicesStateModel): AbstractDevice[] {
    return knownDevices.filter((knownDevice) => {
      return (
        [...availableBLEDevices, ...availableUSBDevices].every(
          (availableDevice) => availableDevice.sensorUUID !== knownDevice.sensorUUID,
        ) &&
        (connectedDevice === undefined || connectedDevice.sensorUUID !== knownDevice.sensorUUID)
      );
    });
  }

  @Selector()
  static connectedDevice({ connectedDevice }: DevicesStateModel): AbstractDevice | undefined {
    return connectedDevice;
  }

  @Selector()
  static deviceInDisconnectedMeasureMode({ knownDevices }: DevicesStateModel): AbstractDevice | undefined {
    const devicesInDisconnectedMode = knownDevices.filter((dev) => dev.hasDisconnectedMeasureInProgress);
    if (devicesInDisconnectedMode.length > 0
    ) {
      return devicesInDisconnectedMode[0];
    }
    return undefined;
  }

  @Selector()
  static isScanning({ isScanning }: DevicesStateModel): boolean {
    return isScanning;
  }

  @Selector()
  static editedDevice({ editedDevice }: DevicesStateModel): AbstractDevice | undefined {
    return editedDevice;
  }

  @Action(InitDevices)
  initUser({ patchState }: StateContext<DevicesStateModel>, { knownDevices }: InitDevices) {
    patchState({ knownDevices });
  }

  @Action(StartDiscoverBLEDevices, { cancelUncompleted: true })
  startDiscoverBLEDevices({ patchState, dispatch }: StateContext<DevicesStateModel>) {
    return (
      environment.mockDevice
        ? dispatch(new BLEDevicesDiscovered([new DeviceMock()]))
        : this.bleDevicesService.startDiscoverDevices()
    ).pipe(
      tap(() =>
        patchState({
          isScanning: true,
        }),
      ),
    );
  }

  @Action(StartDiscoverUSBDevices, { cancelUncompleted: true })
  startDiscoverUSBDevices({ patchState }: StateContext<DevicesStateModel>) {
    return environment.mockDevice
      ? of(null)
      : this.usbDevicesService.startDiscoverDevices().pipe(
        tap(() =>
          patchState({
            isScanning: true,
          }),
        ),
      );
  }

  @Action(StopDiscoverDevices)
  stopDiscoverDevices({ patchState }: StateContext<DevicesStateModel>) {
    patchState({
      isScanning: false,
      availableBLEDevices: [],
      availableUSBDevices: [],
    });
  }

  @Action(BLEConnectionLost)
  bleConnectionLost({ patchState }: StateContext<DevicesStateModel>) {
    patchState({
      isScanning: false,
      availableBLEDevices: [],
    });
  }

  @Action(BLEDevicesDiscovered)
  bleDevicesDiscovered({ getState, patchState }: StateContext<DevicesStateModel>, { devices }: BLEDevicesDiscovered) {
    const { knownDevices } = getState();
    patchState({
      availableBLEDevices: [
        ...devices.map((device) => ({
          ...(knownDevices.find((knownDevice) => knownDevice.sensorUUID === device.sensorUUID) || device),
          batteryLevel: device.batteryLevel,
        })),
      ],
    });
  }

  @Action(USBDevicesDiscovered)
  usbDevicesDiscovered({ getState, patchState }: StateContext<DevicesStateModel>, { devices }: USBDevicesDiscovered) {
    const { knownDevices } = getState();
    patchState({
      availableUSBDevices: [
        ...devices.map((device) => ({
          ...((knownDevices.find(
            (knownDevice: AbstractUSBDevice) =>
              knownDevice.pid !== undefined && knownDevice.sensorUUID === device.sensorUUID,
          ) as AbstractUSBDevice) || device),
          batteryLevel: device.batteryLevel,
        })),
      ],
    });
  }

  @Action(ConnectDevice, { cancelUncompleted: true })
  connectDevice({ getState, patchState, dispatch }: StateContext<DevicesStateModel>, { device }: ConnectDevice) {
    return dispatch(new DisconnectDevice()).pipe(
      concatMap(() => {
        return this.devicesService
          .service(device)
          .connectDevice(device)
          .pipe(
            tap(() => {
              const { knownDevices } = getState();
              if (knownDevices.find((knownDevice) => knownDevice.sensorUUID === device.sensorUUID)) {
                patchState({
                  connectedDevice: device,
                });
              } else {
                patchState({
                  connectedDevice: device,
                  knownDevices: [...knownDevices, device],
                });
              }
            }),
          );
      }),
    );
  }

  @Action(DeviceConnectionLost)
  deviceConnectionLost({ getState, patchState }: StateContext<DevicesStateModel>) {
    // Ignore this is disconnected measure are in progress
    const { connectedDevice, knownDevices } = getState();
    const devicesInDisconnectedMode = knownDevices.filter((dev) => dev.hasDisconnectedMeasureInProgress);
    console.info("Connection lost with " + devicesInDisconnectedMode.length + " devices in disconnected state")
  }

  @Action(DisconnectDevice)
  disconnectDevice({ getState, patchState }: StateContext<DevicesStateModel>) {
    const { connectedDevice } = getState();
    if (connectedDevice) {
      return this.devicesService
        .service(connectedDevice)
        .disconnectDevice(connectedDevice)
        .pipe(
          tap(() => {
            patchState({
              connectedDevice: undefined,
            });
          }),
        );
    } else {
      return of(null);
    }
  }

  @Action(ActivateDisconnectedMeasureMode)
  activateDisconnectedMeasureMode(deviceStateContext: StateContext<DevicesStateModel>) {
    // Make sure we have both a connected device & a current series in progress
    const { connectedDevice } = deviceStateContext.getState();
    const currentSeries = this.store.selectSnapshot(
      MeasuresState.currentSeries
    );
    if (!connectedDevice || !currentSeries) {
      console.info("Can't activate DisconnectedMeasureMode :  "
        + (connectedDevice ? " no connected device" : "")
        + (currentSeries ? " no current Series" : "")
      );
      return of(null);
    }

    // Turn disconnected measure in progress mode on device and disconnect properly
    connectedDevice.hasDisconnectedMeasureInProgress = true;
    console.info("Activating disconnected measure mode Step 1 : update device " + connectedDevice.apparatusId + "...")
    return deviceStateContext
      .dispatch(new UpdateDevice(connectedDevice))
      .pipe(
        concatMap(() => {
          console.info("Activating disconnected measure mode Step 2 : stopping current measure and save measure serie")
          return deviceStateContext.dispatch(
            new StopMeasureScan(connectedDevice, true)
          )
        }
        ),
        concatMap(() => {
          console.info("Activating disconnected measure mode Step 3 : disconnect device")
          return this.disconnectDevice(deviceStateContext)
        }
        )
      );
  }

  @Action(DisconnectedMeasureSynchronizationSuccess)
  disconnectedMeasureSynchronizationSuccess(stateContext: StateContext<DevicesStateModel>, { diconnectedMeasures }: DisconnectedMeasureSynchronizationSuccess) {
    return stateContext.dispatch(new MergeDisconnectedMeasuresIntoCurrentSeries(diconnectedMeasures))
      .pipe(
        switchMap(() =>
          stateContext.dispatch(new DeactivateDisconnectedMeasureMode())
        )
      )
  }

  @Action(DeactivateDisconnectedMeasureMode)
  deactivateDisconnectedMeasureMode(stateContext: StateContext<DevicesStateModel>) {
    const { knownDevices } = stateContext.getState();
    const patch: Partial<DevicesStateModel> = {};
    patch.knownDevices = knownDevices
    for (let deviceToUpdate of knownDevices.filter(d => d.hasDisconnectedMeasureInProgress)) {
      const deviceIndex = patch.knownDevices!.findIndex((knownDevice) => knownDevice.sensorUUID === deviceToUpdate.sensorUUID);
      deviceToUpdate.hasDisconnectedMeasureInProgress = false
      patch.knownDevices = [...patch.knownDevices!.slice(0, deviceIndex), deviceToUpdate, ...patch.knownDevices!.slice(deviceIndex + 1)];
    }
    localStorage.setItem('disconnected_measure_series', "")
    return stateContext.patchState(patch);
  }

  @Action(UpdateDeviceInfo, { cancelUncompleted: true })
  updateDeviceInfo({ dispatch }: StateContext<DevicesStateModel>, { device }: UpdateDeviceInfo) {
    return this.devicesService
      .service(device)
      .getDeviceInfo(device)
      .pipe(map((update: Partial<AbstractDevice>) => dispatch(new UpdateDevice({ ...device, ...update }))));
  }

  @Action(EditDeviceParams)
  editDeviceParams({ patchState }: StateContext<DevicesStateModel>, action: EditDeviceParams) {
    patchState({
      editedDevice: action.device,
      editedDeviceForm: {
        model: { ...action.device.params },
        dirty: false,
        status: '',
        errors: {},
      },
    });
  }

  @Action(SaveDeviceParams)
  saveDeviceParams({ getState, dispatch }: StateContext<DevicesStateModel>) {
    const { editedDevice, editedDeviceForm, connectedDevice } = getState();
    if (editedDevice && editedDeviceForm) {
      const updatedDevice = {
        ...editedDevice,
        ...{ params: { ...editedDeviceForm.model } },
      };
      if (connectedDevice && connectedDevice.sensorUUID === editedDevice.sensorUUID) {
        return this.devicesService
          .service(updatedDevice)
          .saveDeviceParams(updatedDevice)
          .pipe(map(() => dispatch(new UpdateDevice(updatedDevice))));
      } else {
        return dispatch(new UpdateDevice(updatedDevice));
      }
    } else {
      return of(null);
    }
  }

  @Action(UpdateDevice)
  updateDevice({ patchState, getState }: StateContext<DevicesStateModel>, { device }: UpdateDevice) {
    const { connectedDevice, knownDevices } = getState();
    const patch: Partial<DevicesStateModel> = {};
    if (connectedDevice && connectedDevice.sensorUUID === device.sensorUUID) {
      patch.connectedDevice = device;
    }
    const deviceIndex = knownDevices.findIndex((knownDevice) => knownDevice.sensorUUID === device.sensorUUID);
    if (deviceIndex > -1) {
      device.hasDisconnectedMeasureInProgress = knownDevices[deviceIndex].hasDisconnectedMeasureInProgress
      patch.knownDevices = [...knownDevices.slice(0, deviceIndex), device, ...knownDevices.slice(deviceIndex + 1)];
    } else {
      patch.knownDevices = [...knownDevices, device];
    }
    patchState(patch);
  }
}
