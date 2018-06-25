import { AbstractDevice, DeviceType } from './abstract-device';

export class DeviceOGKit extends AbstractDevice {
  readonly apparatusVersion = DeviceType.OGKIT;

  public paramAudioHits = true;
  public paramVisualHits = true;
}

export type Device = DeviceOGKit;
