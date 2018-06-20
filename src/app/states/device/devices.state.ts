import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Device, DeviceStatus } from './device';
import { AddDevice, ConnectDevice, DisconnectDevice } from './device.action';

export interface DevicesStateModel {
  devices: {
    lastId: number;
    list: Device[];
  };
  connectedDevice?: Device;
}

@State<DevicesStateModel>({
  name: 'devices',
  defaults: {
    devices: {
      lastId: 0,
      list: []
    }
  }
})
export class DevicesState {
  @Selector()
  static devices(state: DevicesStateModel): Device[] {
    return state.devices.list;
  }

  @Selector()
  static connectedDevice(state: DevicesStateModel): Device | undefined {
    return state.connectedDevice;
  }

  @Selector()
  static deviceStatus(state: DevicesStateModel): DeviceStatus[] {
    return state.devices.list.map(device => ({
      device,
      isConnected: state.connectedDevice !== undefined && device.id === state.connectedDevice.id
    }));
  }

  @Action(AddDevice)
  addDevice(ctx: StateContext<DevicesStateModel>, action: AddDevice) {
    const state = ctx.getState();
    action.newDevice.id = state.devices.lastId;
    ctx.patchState({ devices: { list: [...state.devices.list, action.newDevice], lastId: state.devices.lastId + 1 } });
  }

  @Action(ConnectDevice)
  connectDevice(ctx: StateContext<DevicesStateModel>, action: ConnectDevice) {
    const state = ctx.getState();
    ctx.patchState({
      connectedDevice: action.device
    });
  }

  @Action(DisconnectDevice)
  disconnectDevice(ctx: StateContext<DevicesStateModel>, action: DisconnectDevice) {
    ctx.patchState({
      connectedDevice: undefined
    });
  }
}
