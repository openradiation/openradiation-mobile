import { Injectable } from '@angular/core';
import { Measure, MeasureSeries, MeasureType, V1OrganisationReporting } from '../states/measures/measure';
import { UserStateModel } from '../states/user/user.state';

declare var sqlitePlugin: any;

@Injectable({
  providedIn: 'root'
})
export class V1MigrationService {
  retrieveUser(): Promise<Partial<UserStateModel>> {
    return new Promise((resolve, reject) => {
      sqlitePlugin.openDatabase('Database', '1.0', 'OpenRadiation', -1).transaction((txn: any) => {
        txn.executeSql(
          'SELECT paramName, libre FROM params WHERE paramName="login" OR paramName="mdp"',
          [],
          (tx: any, res: any) => {
            const items: any = {};
            if (res.rows.length > 0) {
              for (let i = 0; i < res.rows.length; i++) {
                items[res.rows.item(i).paramName] = res.rows.item(i).libre;
              }
            }
            resolve({ login: items.login, password: items.mdp });
          },
          (tx: any, res: any) => {
            reject(res);
          }
        );
      });
    });
  }

  retrieveMeasures(): Promise<(Measure | MeasureSeries)[]> {
    return new Promise((resolve, reject) => {
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
    });
  }

  private static transformMeasureToV2(item: any): Measure {
    return {
      type: MeasureType.Measure,
      apparatusId: item.apparatusId,
      apparatusVersion: item.apparatusVersion,
      apparatusSensorType: item.apparatusSensorType,
      apparatusTubeType: item.apparatusTubeType,
      temperature: item.temperature,
      value: item.radiation,
      hitsNumber: item.nbHits,
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      accuracy: parseFloat(item.accuracy),
      altitude: parseFloat(item.altitude),
      altitudeAccuracy: parseFloat(item.altitudeAccuracy),
      deviceUuid: item.deviceUUID,
      devicePlatform: item.devicePlatform,
      deviceVersion: item.deviceVersion,
      deviceModel: item.deviceModel,
      reportUuid: item.reportUUID,
      manualReporting: item.manualReporting !== 'false',
      organisationReporting: V1OrganisationReporting,
      description: item.notes,
      measurementHeight: item.position,
      tags: item.tags.toString().split(/[\s,]+/),
      measurementEnvironment: item.environment,
      id: item.reportUUID,
      startTime: item.tsStart * 1000,
      endTime: item.tsStart * 1000 + item.duration * 1000,
      sent: item.sent !== 0
    };
  }
}
