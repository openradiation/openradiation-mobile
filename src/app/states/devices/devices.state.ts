import { Action, Selector, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';
import { AbstractDevice } from './abstract-device';
import { BLEDevicesService } from './ble/ble-devices.service';
import { DeviceParams } from './device-params';
import {
  BLEConnectionLost,
  ConnectDevice,
  DeviceConnectionLost,
  DevicesDiscovered,
  DisconnectDevice,
  EditDeviceParams,
  SaveDeviceParams,
  StartDiscoverBLEDevices,
  StartDiscoverUSBDevices,
  StopDiscoverDevices,
  UpdateDevice,
  UpdateDeviceInfo
} from './devices.action';

export interface DevicesStateModel {
  isScanning: boolean;
  availableDevices: AbstractDevice[];
  knownDevices: AbstractDevice[];
  connectedDevice?: AbstractDevice;
  editedDevice?: AbstractDevice;
  editedDeviceForm?: {
    model: DeviceParams;
    dirty: boolean;
    status: string;
    errors: any;
  };
}

@State<DevicesStateModel>({
  name: 'devices',
  defaults: {
    isScanning: false,
    availableDevices: [],
    knownDevices: []
  }
})
export class DevicesState {
  constructor(private devicesService: BLEDevicesService) {}

  @Selector()
  static availableDevices(state: DevicesStateModel): AbstractDevice[] {
    return state.availableDevices.filter(
      availableDevice =>
        state.connectedDevice === undefined || state.connectedDevice.sensorUUID !== availableDevice.sensorUUID
    );
  }

  @Selector()
  static knownDevices(state: DevicesStateModel): AbstractDevice[] {
    return state.knownDevices.filter(knownDevice => {
      return (
        state.availableDevices.every(availableDevice => availableDevice.sensorUUID !== knownDevice.sensorUUID) &&
        (state.connectedDevice === undefined || state.connectedDevice.sensorUUID !== knownDevice.sensorUUID)
      );
    });
  }

  @Selector()
  static connectedDevice(state: DevicesStateModel): AbstractDevice | undefined {
    return state.connectedDevice;
  }

  @Selector()
  static isScanning(state: DevicesStateModel): boolean {
    return state.isScanning;
  }

  @Selector()
  static editedDevice(state: DevicesStateModel): AbstractDevice | undefined {
    return state.editedDevice;
  }

  @Action(StartDiscoverBLEDevices, { cancelUncompleted: true })
  startDiscoverBLEDevices({ patchState }: StateContext<DevicesStateModel>) {
    return this.devicesService.startDiscoverDevices().pipe(
      tap(() =>
        patchState({
          isScanning: true
        })
      )
    );
  }

  @Action(StartDiscoverUSBDevices, { cancelUncompleted: true })
  startDiscoverUSBDevices({ patchState }: StateContext<DevicesStateModel>) {
    return this.devicesService.startDiscoverDevices().pipe(
      tap(() =>
        patchState({
          isScanning: true
        })
      )
    );
  }

  @Action(StopDiscoverDevices)
  stopDiscoverDevices({ patchState }: StateContext<DevicesStateModel>) {
    patchState({
      isScanning: false,
      availableDevices: []
    });
  }

  @Action(BLEConnectionLost)
  bleConnectionLost({ patchState }: StateContext<DevicesStateModel>) {
    patchState({
      isScanning: false,
      availableDevices: []
    });
  }

  @Action(DevicesDiscovered)
  devicesDiscovered({ getState, patchState }: StateContext<DevicesStateModel>, { devices }: DevicesDiscovered) {
    const { knownDevices } = getState();
    patchState({
      availableDevices: [
        ...devices.map(device => ({
          ...(knownDevices.find(knownDevice => knownDevice.sensorUUID === device.sensorUUID) || device),
          batteryLevel: device.batteryLevel
        }))
      ]
    });
  }

  @Action(ConnectDevice, { cancelUncompleted: true })
  connectDevice({ getState, patchState, dispatch }: StateContext<DevicesStateModel>, { device }: ConnectDevice) {
    return dispatch(new DisconnectDevice()).pipe(
      concatMap(() => {
        return this.devicesService.connectDevice(device).pipe(
          tap(() => {
            const { knownDevices } = getState();
            if (knownDevices.find(knownDevice => knownDevice.sensorUUID === device.sensorUUID)) {
              patchState({
                connectedDevice: device
              });
            } else {
              patchState({
                connectedDevice: device,
                knownDevices: [...knownDevices, device]
              });
            }
          })
        );
      })
    );
  }

  @Action(DeviceConnectionLost)
  deviceConnectionLost({ patchState }: StateContext<DevicesStateModel>) {
    patchState({
      connectedDevice: undefined
    });
  }

  @Action(DisconnectDevice)
  disconnectDevice({ getState, patchState }: StateContext<DevicesStateModel>) {
    const { connectedDevice } = getState();
    if (connectedDevice) {
      return this.devicesService.disconnectDevice(connectedDevice).pipe(
        tap(() => {
          patchState({
            connectedDevice: undefined
          });
        })
      );
    } else {
      return of(null);
    }
  }

  @Action(UpdateDeviceInfo, { cancelUncompleted: true })
  updateDeviceInfo({ dispatch }: StateContext<DevicesStateModel>, { device }: UpdateDeviceInfo) {
    return this.devicesService
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
        errors: {}
      }
    });
  }

  @Action(SaveDeviceParams)
  saveDeviceParams({ getState, dispatch }: StateContext<DevicesStateModel>) {
    const { editedDevice, editedDeviceForm, connectedDevice } = getState();
    if (editedDevice && editedDeviceForm) {
      const updatedDevice = {
        ...editedDevice,
        ...{ params: { ...editedDeviceForm.model } }
      };
      if (connectedDevice && connectedDevice.sensorUUID === editedDevice.sensorUUID) {
        return this.devicesService
          .saveDeviceParams(updatedDevice)
          .pipe(map(() => dispatch(new UpdateDevice(updatedDevice))));
      } else {
        return dispatch(new UpdateDevice(updatedDevice));
      }
    } else {
      return of();
    }
  }

  @Action(UpdateDevice)
  updateDevice({ patchState, getState }: StateContext<DevicesStateModel>, { device }: UpdateDevice) {
    const { connectedDevice, knownDevices } = getState();
    const patch: Partial<DevicesStateModel> = {};
    if (connectedDevice && connectedDevice.sensorUUID === device.sensorUUID) {
      patch.connectedDevice = device;
    }
    const deviceIndex = knownDevices.findIndex(knownDevice => knownDevice.sensorUUID === device.sensorUUID);
    if (deviceIndex > -1) {
      patch.knownDevices = [
        ...knownDevices.slice(0, Math.max(deviceIndex - 1, 0)),
        device,
        ...knownDevices.slice(deviceIndex + 1)
      ];
    } else {
      patch.knownDevices = [...knownDevices, device];
    }
    patchState(patch);
  }
}
