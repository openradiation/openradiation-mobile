import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Device, DeviceStatus } from './device';
import {
  ConnectDevice,
  DevicesDiscovered,
  DisconnectDevice,
  StartDiscoverDevices,
  StopDiscoverDevices
} from './devices.action';
import { DevicesService } from './devices.service';
import { tap } from 'rxjs/operators';

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
    return state.availableDevices;
  }

  @Selector()
  static knownDevices(state: DevicesStateModel): Device[] {
    return state.knownDevices.filter(knownDevice => {
      return state.availableDevices.every(device => device.sensorUUID !== knownDevice.sensorUUID);
    });
  }

  @Selector()
  static connectedDevice(state: DevicesStateModel): Device | undefined {
    return state.connectedDevice;
  }

  @Selector()
  static deviceStatus(state: DevicesStateModel): DeviceStatus[] {
    return state.availableDevices.map(device => ({
      device,
      isConnected: state.connectedDevice !== undefined && device.sensorUUID === state.connectedDevice.sensorUUID
    }));
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
  }

  @Action(DisconnectDevice)
  disconnectDevice({ patchState }: StateContext<DevicesStateModel>, action: DisconnectDevice) {
    patchState({
      connectedDevice: undefined
    });
  }
}
