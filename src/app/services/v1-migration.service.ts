import { UserStateModel } from '../states/user/user.state';
import { Injectable } from '@angular/core';
import { Measure, MeasureSeries, MeasureType } from '../states/measures/measure';

declare var sqlitePlugin: any;

@Injectable({
  providedIn: 'root'
})
export class V1MigrationService {
  retrieveUser(): Promise<Partial<UserStateModel>> {
    return new Promise((resolve, reject) => {
      sqlitePlugin.openDatabase('Database', '1.0', 'OpenRadiation', -1).transaction((txn: any) => {
        txn.executeSql(
          'SELECT paramName, libre FROM params WHERE paramName="login" OR paramName="mdq"',
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
                measures[i] = this.transformMeasureToV2(res.rows.item(i));
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

  transformMeasureToV2(item: any): Measure {
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
      organisationReporting: 'OpenRadiation app 1.0.0',
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

  sqLiteTest() {
    const db = sqlitePlugin.openDatabase('Database', '1.0', 'OpenRadiation', -1);
    db.transaction((txn: any) => {
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS "params" ' +
          ' ("id" INTEGER PRIMARY KEY AUTOINCREMENT , ' +
          '  "paramName" VARCHAR,' +
          '  "active" BOOLEAN not null default 0,' +
          '  "libre" TEXT);',
        [],
        (tx: any, res: any) => {
          console.log('create user ok', res);
        },
        (tx: any, res: any) => {
          console.error('create user fail', res);
        }
      );
    });
    db.transaction((txn: any) => {
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS "measures" ' +
          ' ("id" INTEGER PRIMARY KEY AUTOINCREMENT , ' +
          '  "sensorUUID" VARCHAR,' +
          '  "apparatusId" VARCHAR,' +
          '  "apparatusVersion" VARCHAR,' +
          '  "apparatusSensorType" VARCHAR,' +
          '  "apparatusTubeType" VARCHAR,' +
          '  "reportUUID" VARCHAR,' +
          '  "deviceUUID" VARCHAR,' +
          '  "devicePlatform" VARCHAR,' +
          '  "deviceVersion" VARCHAR,' +
          '  "deviceModel" VARCHAR,' +
          '  "tsStart" TIMESTAMP,' +
          '  "tsEnd" TIMESTAMP,' +
          '  "duration" VARCHAR,' +
          '  "temperature" FLOAT,' +
          '  "nbHits" INTEGER,' +
          '  "radiation" FLOAT,' +
          '  "manualReporting" BOOLEAN DEFAULT FALSE,' +
          '  "longitude" VARCHAR,' +
          '  "latitude" VARCHAR,' +
          '  "accuracy" VARCHAR,' +
          '  "altitude" VARCHAR,' +
          '  "altitudeAccuracy" VARCHAR,' +
          '  "environment" VARCHAR,' +
          '  "position" INTEGER,' +
          '  "tags" TEXT,' +
          '  "notes" TEXT,' +
          '  "sent" BOOLEAN DEFAULT FALSE);',
        [],
        (tx: any, res: any) => {
          console.log('create measure ok', res);
        },
        (tx: any, res: any) => {
          console.error('create measure fail', res);
        }
      );
    });
    this.sqLiteTestInsertUser('connexion', 1, '');
    this.sqLiteTestInsertUser('login', 1, 'user1');
    this.sqLiteTestInsertUser('mdp', 1, '123456789');
    this.sqLiteTestDelete();
    this.sqLiteTestInsertMeasure(
      'aa6iod08-d87e-45e4-8511-d0d0aa04fc3f',
      'C781B485-9273-4C03-B9A5-662837852B2D',
      'android',
      '6.0',
      'E5603',
      1543314838,
      1543314939,
      101, // ??
      28,
      66,
      1.12959753729484,
      false,
      '48.1317742',
      '-1.6217496',
      800,
      43,
      800,
      'city',
      1,
      'tag1 tag2,tag3',
      'description measure 1',
      1
    );
    this.sqLiteTestInsertMeasure(
      '2de5io21-b94a-48ae-948f-556374137cb7',
      '',
      '',
      '',
      '',
      1543397707,
      1543398307,
      600, // ??
      28,
      166,
      1.82989753725684,
      false,
      '48.1317014',
      '-1.6240225',
      800,
      43,
      800,
      'inside',
      1,
      'tag1 tag2,tag3',
      'description measure 2',
      0
    );
    this.sqLiteTestInsertMeasure(
      '2de5a321-b94a-48ae-978f-590374137er7',
      'C781B485-9273-4C03-B9A5-662837852B2D',
      'android',
      '6.0',
      'E5603',
      1543398607,
      1543399027,
      420, // ??
      28,
      166,
      2.12489754685684,
      false,
      '48.1317014',
      '-1.6240225',
      800,
      43,
      800,
      'inside',
      1,
      'tag1 tag2,tag3',
      'description measure 3',
      1
    );
  }

  sqLiteTestInsertUser(paramName: string, active: number, text: string) {
    const db = sqlitePlugin.openDatabase('Database', '1.0', 'OpenRadiation', -1);
    db.transaction((txn: any) => {
      txn.executeSql('SELECT * FROM "params" WHERE paramName="' + paramName + '";', [], (tx: any, res: any) => {
        if (res.rows.length > 0) {
          tx.executeSql(
            'UPDATE "params" ' +
              'SET active = ' +
              active +
              ', libre = "' +
              text +
              '"' +
              'WHERE paramName="' +
              paramName +
              '";',
            [],
            (t: any, insert: any) => {
              console.log('update ok', insert);
            },
            (t: any, insert: any) => {
              console.error('update fail', insert);
            }
          );
        } else {
          tx.executeSql(
            'INSERT INTO "params" ' +
              '(paramName, active, libre) VALUES("' +
              paramName +
              '",' +
              active +
              ',"' +
              text +
              '");',
            [],
            (t: any, insert: any) => {
              console.log('insert ok', insert);
            },
            (t: any, insert: any) => {
              console.error('insert fail', insert);
            }
          );
        }
      });
    });
  }

  sqLiteTestInsertMeasure(
    reportUuid: string,
    deviceUuid: string,
    devicePlatform: string,
    deviceVersion: string,
    deviceModel: string,
    startTime: number,
    endTime: number,
    duration: number,
    temperature: number,
    nbHit: number,
    value: number,
    manualReport: boolean,
    long: string,
    lat: string,
    accuracy: number,
    altitude: number,
    altitudeAccuracy: number,
    env: string,
    position: number,
    tags: string,
    notes: string,
    sent: number
  ) {
    const apparatusInfos = 'undefined","000107","OG-KIT1","geiger","SBM-20","';
    const db = sqlitePlugin.openDatabase('Database', '1.0', 'OpenRadiation', -1);
    db.transaction((txn: any) => {
      txn.executeSql(
        'INSERT INTO "measures" ' +
          '(sensorUUID,apparatusId,apparatusVersion,apparatusSensorType,apparatusTubeType,' +
          'reportUUID,' +
          'deviceUUID,devicePlatform,deviceVersion,deviceModel,' +
          'tsStart, tsEnd,duration, temperature, nbHits,radiation,manualReporting,' +
          'longitude,latitude,accuracy,altitude,altitudeAccuracy,' +
          'environment,position,tags,notes,sent) VALUES("' +
          apparatusInfos +
          reportUuid +
          '","' +
          deviceUuid +
          '","' +
          devicePlatform +
          '","' +
          deviceVersion +
          '","' +
          deviceModel +
          '","' +
          startTime +
          '","' +
          endTime +
          '","' +
          duration +
          '","' +
          temperature +
          '","' +
          nbHit +
          '","' +
          value +
          '","' +
          manualReport +
          '","' +
          long +
          '","' +
          lat +
          '","' +
          accuracy +
          '","' +
          altitude +
          '","' +
          altitudeAccuracy +
          '","' +
          env +
          '","' +
          position +
          '","' +
          tags +
          '","' +
          notes +
          '","' +
          sent +
          '");',
        [],
        (t: any, insert: any) => {
          console.log('insert ok', insert);
        },
        (t: any, insert: any) => {
          console.error('insert fail', insert);
        }
      );
    });
  }

  sqLiteTestDelete() {
    const db = sqlitePlugin.openDatabase('Database', '1.0', 'OpenRadiation', -1);
    db.transaction((txn: any) => {
      txn.executeSql(
        'DELETE FROM "measures"',
        [],
        function(tx: any, res: any) {
          console.log('Success delete', res);
        },
        function(tx: any, error: any) {
          console.error('Error delete: ' + error.message);
        }
      );
    });
  }
}
