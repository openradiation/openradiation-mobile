import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Device } from './device';
import { AddDevice, ConnectDevice, DisconnectDevice } from './device.action';

export interface DevicesStateModel {
  lastId: number;
  devices: Device[];
  connectedDevice?: Device;
}

@State<DevicesStateModel>({
  name: 'devices',
  defaults: {
    lastId: 0,
    devices: []
  }
})
export class DevicesState {
  @Selector()
  static devices(state: DevicesStateModel) {
    return state.devices;
  }

  @Selector()
  static connectedDevice(state: DevicesStateModel) {
    return state.connectedDevice;
  }

  @Action(AddDevice)
  addDevice(ctx: StateContext<DevicesStateModel>, action: AddDevice) {
    const state = ctx.getState();
    action.newDevice.id = state.lastId;
    ctx.patchState({ devices: [...state.devices, action.newDevice], lastId: state.lastId + 1 });
  }

  @Action(ConnectDevice)
  connectDevice(ctx: StateContext<DevicesStateModel>, action: ConnectDevice) {
    const state = ctx.getState();
    const connectedDevice = { ...action.device, connected: true };
    ctx.patchState({
      connectedDevice,
      devices: state.devices.map(
        device =>
          state.connectedDevice && state.connectedDevice.id === device.id
            ? { ...device, connected: false }
            : device.id === action.device.id
              ? connectedDevice
              : device
      )
    });
  }

  @Action(DisconnectDevice)
  disconnectDevice(ctx: StateContext<DevicesStateModel>, action: DisconnectDevice) {
    const state = ctx.getState();
    ctx.patchState({
      connectedDevice: undefined,
      devices: state.devices.map(device => (action.device.id ? { ...device, connected: false } : device))
    });
  }
}
