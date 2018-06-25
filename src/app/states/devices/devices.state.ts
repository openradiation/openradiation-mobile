import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { Device } from './device';
import {
  ConnectDevice,
  ConnectionLost,
  DevicesDiscovered,
  DisconnectDevice,
  StartDiscoverDevices,
  StopDiscoverDevices,
  UpdateDeviceInfo
} from './devices.action';
import { DevicesService } from './devices.service';

export interface DevicesStateModel {
  isScanning: boolean;
  availableDevices: Device[];
  knownDevices: Device[];
  connectedDevice?: Device;
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

  @Action(StopDiscoverDevices, { cancelUncompleted: true })
  stopDiscoverDevices({ patchState }: StateContext<DevicesStateModel>) {
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

  @Action(ConnectDevice)
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

  @Action(ConnectionLost)
  connectionLost({ patchState }: StateContext<DevicesStateModel>) {
    patchState({
      connectedDevice: undefined
    });
  }

  @Action(DisconnectDevice)
  disconnectDevice({ patchState }: StateContext<DevicesStateModel>, action: DisconnectDevice) {
    return this.devicesService.disconnectDevice(action.device).pipe(
      tap(() => {
        patchState({
          connectedDevice: undefined
        });
      })
    );
  }

  @Action(UpdateDeviceInfo)
  updateDeviceInfo({ patchState, getState }: StateContext<DevicesStateModel>, action: UpdateDeviceInfo) {
    return this.devicesService.getDeviceInfo(action.device).pipe(
      tap((update: Partial<Device>) => {
        console.log(update);
        const state = getState();
        const patch: Partial<DevicesStateModel> = {};
        const updatedDevice = { ...action.device, ...update };
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
        }
        patchState(patch);
      })
    );
  }
}
