import { UserStateModel } from '../states/user/user.state';
import { Injectable } from '@angular/core';

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
    this.sqLiteTestInsertMeasure(
      'aa6f1d08-d87e-45e4-8511-d0d0aa04fc3f',
      'android',
      '6.0',
      'E5603',
      '2018-11-19T15:18:37.371Z',
      '??', // ??
      28,
      66,
      1.62959753729484,
      true,
      '48.1317742',
      '-1.6217496',
      '800',
      '43', // ??
      '800', // ??
      'city', // ??
      1,
      'tag1', // ??
      'description test'
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
    devicePlatform: string,
    deviceVersion: string,
    deviceModel: string,
    startTime: any,
    duration: any,
    temperature: number,
    nbHit: number,
    value: number,
    manualReport: boolean,
    long: string,
    lat: string,
    accuracy: string,
    altitude: string,
    altitudeAccuracy: string,
    env: string,
    position: number,
    tags: string,
    notes: string
  ) {
    const apparatusInfos = 'undefined","undefined","undefined","undefined","undefined","';
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
          devicePlatform +
          '","' +
          deviceVersion +
          '","' +
          deviceModel +
          '","' +
          startTime +
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
          '0);',
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
}
