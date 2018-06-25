export abstract class AbstractDevice {
  abstract readonly apparatusVersion: DeviceType;
  apparatusId: string;
  sensorUUID: string;
  apparatusSensorType: string;
  apparatusTubeType: string;

  constructor(rawDevice: RawDevice) {
    this.sensorUUID = rawDevice.id;
    const manufacturerData = new Uint8Array(rawDevice.advertising).slice(23, 29);
    this.apparatusId = new TextDecoder('utf8').decode(manufacturerData);
  }
}

export enum DeviceType {
  OGKIT = 'OG-KIT1'
}

export interface RawDevice {
  name: string;
  id: string;
  advertising: ArrayBuffer;
  rssi: number;
  characteristics?: {
    characteristic: string;
    properties: string[];
    descriptors: any[];
    service: string;
  }[];
}
