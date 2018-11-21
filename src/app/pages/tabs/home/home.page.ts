import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AutoUnsubscribePage } from '../../../components/auto-unsubscribe/auto-unsubscribe.page';
import { NavigationService } from '../../../services/navigation.service';
import { AbstractDevice } from '../../../states/devices/abstract-device';
import { DevicesState } from '../../../states/devices/devices.state';
import { StartMeasure } from '../../../states/measures/measures.action';
import { MeasuresState } from '../../../states/measures/measures.state';

declare var sqlitePlugin: any;

@Component({
  selector: 'app-page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage extends AutoUnsubscribePage {
  @Select(DevicesState.connectedDevice)
  connectedDevice$: Observable<AbstractDevice | undefined>;
  @Select(MeasuresState.positionAccuracy)
  positionAccuracy$: Observable<number>;

  canStartMeasure: Observable<boolean>;

  url = '/tabs/(home:home)';

  constructor(
    protected router: Router,
    private store: Store,
    private actions$: Actions,
    private navigationService: NavigationService
  ) {
    super(router);

    this.canStartMeasure = this.connectedDevice$.pipe(map(connectedDevice => connectedDevice !== undefined));
  }

  pageEnter() {
    super.pageEnter();
    this.subscriptions.push(
      this.actions$
        .pipe(ofActionSuccessful(StartMeasure))
        .subscribe(() => this.navigationService.navigateRoot(['measure', 'scan']))
    );
  }

  goToDevices() {
    this.navigationService.navigateForward([
      'tabs',
      {
        outlets: {
          settings: 'devices',
          home: null
        }
      }
    ]);
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
          console.log('create ok', res);
        },
        (tx: any, res: any) => {
          console.error('create fail', res);
        }
      );
    });
    this.sqLiteTestInsert('connexion', 1, '');
    this.sqLiteTestInsert('login', 1, 'loginUser');
    this.sqLiteTestInsert('mdp', 1, 'azerty');
    //this.sqLiteTestSelect();
  }

  sqLiteTestInsert(paramName: string, active: number, text: string) {
    const db = sqlitePlugin.openDatabase('Database', '1.0', 'OpenRadiation', -1);
    db.transaction((txn: any) => {
      txn.executeSql('SELECT * FROM "params" WHERE paramName="' + paramName + '";', [], (tx: any, res: any) => {
        if (res.rows.length <= 0) {
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

  sqLiteTestSelect() {
    const db = sqlitePlugin.openDatabase('Database', '1.0', 'OpenRadiation', -1);
    db.transaction((txn: any) => {
      txn.executeSql(
        'SELECT * FROM "params";',
        [],
        (tx: any, res: any) => {
          console.log('select ok', res);
        },
        (tx: any, res: any) => {
          console.error('select fail', res);
        }
      );
    });
  }

  sqLiteTestDelete() {
    const db = sqlitePlugin.openDatabase('Database', '1.0', 'OpenRadiation', -1);
    db.transaction((txn: any) => {
      txn.executeSql(
        'DELETE FROM "params"',
        [],
        function(tx: any, res: any) {
          console.log('Success', res);
        },
        function(tx: any, error: any) {
          console.error('Error: ' + error.message);
        }
      );
    });
  }

  startMeasure() {
    this.connectedDevice$.pipe(take(1)).subscribe(connectedDevice => {
      if (connectedDevice) {
        this.store.dispatch(new StartMeasure(connectedDevice));
      }
    });
  }
}
