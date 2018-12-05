import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ApparatusSensorType } from '../states/devices/abstract-device';
import { Measure, MeasureSeries, MeasureType, V1OrganisationReporting } from '../states/measures/measure';
import { UserStateModel } from '../states/user/user.state';

declare var sqlitePlugin: any;

@Injectable({
  providedIn: 'root'
})
export class V1MigrationService {
  constructor(private platform: Platform) {}

  retrieveUser(): Promise<Partial<UserStateModel>> {
    return this.platform.ready().then(
      () =>
        new Promise((resolve, reject) => {
          sqlitePlugin.openDatabase('Database', '1.0', 'OpenRadiation', -1).transaction((txn: any) => {
            txn.executeSql(
              'SELECT paramName, libre FROM params WHERE paramName="login" OR paramName="mdp"',
              [],
              (tx: any, res: any) => {
                const items: any = {};
                if (res.rows.length > 0) {
                  for (let i = 0; i < res.rows.length; i++) {
                    items[res.rows.item(i).paramName] = V1MigrationService.parseV1Data(res.rows.item(i).libre);
                  }
                }
                resolve({ login: items.login, password: items.mdp });
              },
              (tx: any, res: any) => {
                reject(res);
              }
            );
          });
        })
    );
  }

  retrieveMeasures(): Promise<(Measure | MeasureSeries)[]> {
    return this.platform.ready().then(
      () =>
        new Promise<(Measure | MeasureSeries)[]>((resolve, reject) => {
          sqlitePlugin.openDatabase('Database', '1.0', 'OpenRadiation', -1).transaction((txn: any) => {
            txn.executeSql(
              'SELECT * FROM measures',
              [],
              (tx: any, res: any) => {
                const measures: Measure[] = [];
                if (res.rows.length > 0) {
                  for (let i = 0; i < res.rows.length; i++) {
                    measures[i] = V1MigrationService.transformMeasureToV2(res.rows.item(i));
                  }
                }
                resolve(measures);
              },
              (tx: any, res: any) => {
                reject(res);
              }
            );
          });
        })
    );
  }

  private static transformMeasureToV2(item: any): Measure {
    return {
      type: MeasureType.Measure,
      apparatusId: V1MigrationService.parseV1Data(item.apparatusId),
      apparatusVersion: V1MigrationService.parseV1Data(item.apparatusVersion),
      apparatusSensorType: ApparatusSensorType.Geiger,
      apparatusTubeType: V1MigrationService.parseV1Data(item.apparatusTubeType),
      temperature: V1MigrationService.parseV1Data(item.temperature),
      value: V1MigrationService.parseV1Data(item.radiation),
      hitsNumber: V1MigrationService.parseV1Data(item.nbHits),
      latitude: V1MigrationService.parseV1Data(parseFloat(item.latitude)),
      longitude: V1MigrationService.parseV1Data(parseFloat(item.longitude)),
      accuracy: V1MigrationService.parseV1Data(parseFloat(item.accuracy)),
      altitude: V1MigrationService.parseV1Data(parseFloat(item.altitude)),
      altitudeAccuracy: V1MigrationService.parseV1Data(parseFloat(item.altitudeAccuracy)),
      deviceUuid: V1MigrationService.parseV1Data(item.deviceUUID),
      devicePlatform: V1MigrationService.parseV1Data(item.devicePlatform),
      deviceVersion: V1MigrationService.parseV1Data(item.deviceVersion),
      deviceModel: V1MigrationService.parseV1Data(item.deviceModel),
      reportUuid: V1MigrationService.parseV1Data(item.reportUUID),
      manualReporting: item.manualReporting !== 'false',
      organisationReporting: V1OrganisationReporting,
      description: V1MigrationService.parseV1Data(item.notes),
      measurementHeight: V1MigrationService.parseV1Data(item.position),
      tags: item.tags ? (<string>item.tags).split(/[\s,]+/) : undefined,
      measurementEnvironment: V1MigrationService.parseV1Data(item.environment),
      id: V1MigrationService.parseV1Data(item.reportUUID),
      startTime: V1MigrationService.parseV1Data(item.tsStart * 1000),
      endTime: V1MigrationService.parseV1Data(item.tsStart * 1000 + item.duration * 1000),
      sent: item.sent !== 0
    };
  }

  private static parseV1Data(data: any): any {
    return data === 0 || (data && data !== 'undefined') ? data : undefined;
  }
}
