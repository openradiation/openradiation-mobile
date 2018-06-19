import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Device } from './device';
import { AddDevice } from './device.action';

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
    action.newDevice.id = state.lastId + 1;
    ctx.patchState({ devices: [...state.devices, action.newDevice], lastId: action.newDevice.id });
  }
}
