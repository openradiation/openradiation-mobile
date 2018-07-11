import { Action, Selector, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DeviceParams } from './abstract-device';
import { Device } from './device';
import {
  BLEConnectionLost,
  ConnectDevice,
  DeviceConnectionLost,
  DevicesDiscovered,
  DisconnectDevice,
  EditDeviceParams,
  SaveDeviceParams,
  StartDiscoverDevices,
  StopDiscoverDevices,
  UpdateDevice,
  UpdateDeviceInfo
} from './devices.action';
import { DevicesService } from './devices.service';

export interface DevicesStateModel {
  isScanning: boolean;
  availableDevices: Device[];
  knownDevices: Device[];
  connectedDevice?: Device;
  editedDevice?: Device;
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
  constructor(private devicesService: DevicesService) {}

  @Selector()
  static availableDevices(state: DevicesStateModel): Device[] {
    return state.availableDevices.filter(
      availableDevice =>
        state.connectedDevice === undefined || state.connectedDevice.sensorUUID !== availableDevice.sensorUUID
    );
  }

  @Selector()
  static knownDevices(state: DevicesStateModel): Device[] {
    return state.knownDevices.filter(knownDevice => {
      return (
        state.availableDevices.every(availableDevice => availableDevice.sensorUUID !== knownDevice.sensorUUID) &&
        (state.connectedDevice === undefined || state.connectedDevice.sensorUUID !== knownDevice.sensorUUID)
      );
    });
  }

  @Selector()
  static connectedDevice(state: DevicesStateModel): Device | undefined {
    return state.connectedDevice;
  }

  @Selector()
  static isScanning(state: DevicesStateModel): boolean {
    return state.isScanning;
  }

  @Selector()
  static editedDevice(state: DevicesStateModel): Device | undefined {
    return state.editedDevice;
  }

  @Action(StartDiscoverDevices, { cancelUncompleted: true })
  startDiscoverDevices({ patchState }: StateContext<DevicesStateModel>) {
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
  devicesDiscovered({ getState, patchState }: StateContext<DevicesStateModel>, action: DevicesDiscovered) {
    const state = getState();
    patchState({
      availableDevices: [
        ...action.devices.map(
          device => state.knownDevices.find(knownDevice => knownDevice.sensorUUID === device.sensorUUID) || device
        )
      ]
    });
  }

  @Action(ConnectDevice, { cancelUncompleted: true })
  connectDevice({ getState, patchState }: StateContext<DevicesStateModel>, action: ConnectDevice) {
    return this.devicesService.connectDevice(action.device).pipe(
      tap(() => {
        const state = getState();
        if (state.knownDevices.find(device => device.sensorUUID === action.device.sensorUUID)) {
          patchState({
            connectedDevice: action.device
          });
        } else {
          patchState({
            connectedDevice: action.device,
            knownDevices: [...state.knownDevices, action.device]
          });
        }
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
    const state = getState();
    if (state.connectedDevice) {
      return this.devicesService.disconnectDevice(state.connectedDevice).pipe(
        tap(() => {
          patchState({
            connectedDevice: undefined
          });
        })
      );
    } else {
      return of();
    }
  }

  @Action(UpdateDeviceInfo, { cancelUncompleted: true })
  updateDeviceInfo({ dispatch }: StateContext<DevicesStateModel>, action: UpdateDeviceInfo) {
    return this.devicesService
      .getDeviceInfo(action.device)
      .pipe(map((update: Partial<Device>) => dispatch(new UpdateDevice(action.device, update))));
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
    const state = getState();
    if (state.editedDevice && state.editedDeviceForm) {
      return dispatch(new UpdateDevice(state.editedDevice, { params: { ...state.editedDeviceForm.model } }));
    } else {
      return of();
    }
  }

  @Action(UpdateDevice)
  updateItem({ patchState, getState }: StateContext<DevicesStateModel>, action: UpdateDevice) {
    const state = getState();
    const patch: Partial<DevicesStateModel> = {};
    const updatedDevice = { ...action.device, ...action.update };
    if (state.connectedDevice && state.connectedDevice.sensorUUID === action.device.sensorUUID) {
      patch.connectedDevice = updatedDevice;
    }
    const deviceIndex = state.knownDevices.findIndex(
      knownDevice => knownDevice.sensorUUID === action.device.sensorUUID
    );
    if (deviceIndex > -1) {
      patch.knownDevices = [
        ...state.knownDevices.slice(0, deviceIndex - 1),
        updatedDevice,
        ...state.knownDevices.slice(deviceIndex + 1)
      ];
    } else {
      patch.knownDevices = [...state.knownDevices, updatedDevice];
    }
    patchState(patch);
  }
}
