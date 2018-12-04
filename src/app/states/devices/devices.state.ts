import { Action, Selector, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';
import { AbstractDevice } from './abstract-device';
import { AbstractBLEDevice } from './ble/abstract-ble-device';
import { BLEDevicesService } from './ble/ble-devices.service';
import { DeviceParams } from './device-params';
import {
  BLEConnectionLost,
  BLEDevicesDiscovered,
  ConnectDevice,
  DeviceConnectionLost,
  DisconnectDevice,
  EditDeviceParams,
  SaveDeviceParams,
  StartDiscoverBLEDevices,
  StartDiscoverUSBDevices,
  StopDiscoverDevices,
  UpdateDevice,
  UpdateDeviceInfo,
  USBDevicesDiscovered
} from './devices.action';
import { DevicesService } from './devices.service';
import { AbstractUSBDevice } from './usb/abstract-usb-device';
import { USBDevicesService } from './usb/usb-devices.service';

export interface DevicesStateModel {
  isScanning: boolean;
  availableBLEDevices: AbstractBLEDevice[];
  availableUSBDevices: AbstractUSBDevice[];
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
    availableBLEDevices: [],
    availableUSBDevices: [],
    knownDevices: []
  }
})
export class DevicesState {
  constructor(
    private devicesService: DevicesService,
    private bleDevicesService: BLEDevicesService,
    private usbDevicesService: USBDevicesService
  ) {}

  @Selector()
  static availableDevices({
    availableBLEDevices,
    availableUSBDevices,
    connectedDevice
  }: DevicesStateModel): AbstractDevice[] {
    return [...availableBLEDevices, ...availableUSBDevices].filter(
      availableDevice => connectedDevice === undefined || connectedDevice.sensorUUID !== availableDevice.sensorUUID
    );
  }

  @Selector()
  static knownDevices({
    knownDevices,
    availableBLEDevices,
    availableUSBDevices,
    connectedDevice
  }: DevicesStateModel): AbstractDevice[] {
    return knownDevices.filter(knownDevice => {
      return (
        [...availableBLEDevices, ...availableUSBDevices].every(
          availableDevice => availableDevice.sensorUUID !== knownDevice.sensorUUID
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
  static isScanning({ isScanning }: DevicesStateModel): boolean {
    return isScanning;
  }

  @Selector()
  static editedDevice({ editedDevice }: DevicesStateModel): AbstractDevice | undefined {
    return editedDevice;
  }

  @Action(StartDiscoverBLEDevices, { cancelUncompleted: true })
  startDiscoverBLEDevices({ patchState }: StateContext<DevicesStateModel>) {
    return this.bleDevicesService.startDiscoverDevices().pipe(
      tap(() =>
        patchState({
          isScanning: true
        })
      )
    );
  }

  @Action(StartDiscoverUSBDevices, { cancelUncompleted: true })
  startDiscoverUSBDevices({ patchState }: StateContext<DevicesStateModel>) {
    return this.usbDevicesService.startDiscoverDevices().pipe(
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
      availableBLEDevices: []
    });
  }

  @Action(BLEConnectionLost)
  bleConnectionLost({ patchState }: StateContext<DevicesStateModel>) {
    patchState({
      isScanning: false,
      availableBLEDevices: []
    });
  }

  @Action(BLEDevicesDiscovered)
  bleDevicesDiscovered({ getState, patchState }: StateContext<DevicesStateModel>, { devices }: BLEDevicesDiscovered) {
    const { knownDevices } = getState();
    patchState({
      availableBLEDevices: [
        ...devices.map(device => ({
          ...(knownDevices.find(knownDevice => knownDevice.sensorUUID === device.sensorUUID) || device),
          batteryLevel: device.batteryLevel
        }))
      ]
    });
  }

  @Action(USBDevicesDiscovered)
  usbDevicesDiscovered({ getState, patchState }: StateContext<DevicesStateModel>, { devices }: USBDevicesDiscovered) {
    const { knownDevices } = getState();
    patchState({
      availableUSBDevices: [
        ...devices.map(device => ({
          ...(<AbstractUSBDevice>(
            knownDevices.find(
              (knownDevice: AbstractUSBDevice) =>
                knownDevice.pid !== undefined && knownDevice.sensorUUID === device.sensorUUID
            )
          ) || device),
          batteryLevel: device.batteryLevel
        }))
      ]
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
      return this.devicesService
        .service(connectedDevice)
        .disconnectDevice(connectedDevice)
        .pipe(
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
    const deviceIndex = knownDevices.findIndex(knownDevice => knownDevice.sensorUUID === device.sensorUUID);
    if (deviceIndex > -1) {
      patch.knownDevices = [...knownDevices.slice(0, deviceIndex), device, ...knownDevices.slice(deviceIndex + 1)];
    } else {
      patch.knownDevices = [...knownDevices, device];
    }
    patchState(patch);
  }
}
