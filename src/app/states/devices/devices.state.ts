import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Device, DeviceStatus } from './device';
import { ConnectDevice, DisconnectDevice, DiscoverDevices } from './devices.action';
import { DevicesService } from './devices.service';
import { tap } from 'rxjs/operators';

export interface DevicesStateModel {
  availableDevices: Device[];
  knownDevices: Device[];
  connectedDevice?: Device;
}

@State<DevicesStateModel>({
  name: 'devices',
  defaults: {
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

  @Action(DiscoverDevices, { cancelUncompleted: true })
  discoverDevices({ getState, patchState }: StateContext<DevicesStateModel>) {
    const state = getState();
    return this.devicesService.discoverDevices().pipe(
      tap(devices => {
        patchState({
          availableDevices: [
            ...devices.map(
              device => state.knownDevices.find(knownDevice => knownDevice.sensorUUID === device.sensorUUID) || device
            )
          ]
        });
      })
    );
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
