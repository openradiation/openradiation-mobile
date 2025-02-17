import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofActionDispatched, ofActionSuccessful, Store } from '@ngxs/store';
import { Observable, take } from 'rxjs';
import { AutoUnsubscribePage } from '@app/components/auto-unsubscribe/auto-unsubscribe.page';
import { AlertService } from '@app/services/alert.service';
import { NavigationService } from '@app/services/navigation.service';
import { Measure, MeasureSeries, MeasureType } from '@app/states/measures/measure';

import { LoadingController } from '@ionic/angular';
import {
  DeleteAllMeasures,
  DeleteMeasure,
  PublishMeasure,
  PublishMeasureError,
  PublishMeasureSuccess,
  PublishMeasureProgress,
  ShowMeasure,
} from '@app/states/measures/measures.action';
import { MeasuresService } from '@app/states/measures/measures.service';
import { MeasuresState } from '@app/states/measures/measures.state';
import { Share } from '@capacitor/share';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage extends AutoUnsubscribePage {
  measures$: Observable<(Measure | MeasureSeries)[]> = inject(Store).select(MeasuresState.measures);
  measureBeingSentMap: { [K: string]: boolean } = {};
  loading?: HTMLIonLoadingElement;
  publishMeasureCountCurrent: number;
  publishMeasureCountTotal: number;
  dtOptions = { bPaginate: false, bFilter: false, bInfo: false, order: [[2, 'desc']] };
  detailedSeries?: MeasureSeries;
  measureSeriesMessageMapping = {
    '=1': _('HISTORY.MEASURE_SERIES.SINGULAR') as string,
    other: _('HISTORY.MEASURE_SERIES.PLURAL') as string,
  };

  url = '/tabs/history';

  constructor(
    protected router: Router,
    private store: Store,
    private alertService: AlertService,
    private translateService: TranslateService,
    private actions$: Actions,
    private toastController: ToastController,
    private navigationService: NavigationService,
    private loadingCtrl: LoadingController,
    private measureService: MeasuresService,
  ) {
    super(router);
  }

  pageEnter() {
    super.pageEnter();
    this.subscriptions.push(
      this.actions$.pipe(ofActionDispatched(PublishMeasureError)).subscribe((error: PublishMeasureError) => {
        this.measureBeingSentMap[error.measure.id] = false;
        this.loading?.dismiss();
        this.loading = undefined;
        this.toastController
          .create({
            message: this.translateService.instant('HISTORY.SEND_ERROR'),
            duration: 3000,
            buttons: [
              {
                text: this.translateService.instant('GENERAL.OK'),
                role: 'cancel',
                handler: () => {
                  // Nothing to do
                },
              },
            ],
          })
          .then((toast) => toast.present());
      }),
      this.actions$.pipe(ofActionDispatched(PublishMeasure)).subscribe(({ measure }: PublishMeasure) => {
        this.measureBeingSentMap[measure.id] = true;
      }),
      this.actions$.pipe(ofActionSuccessful(PublishMeasure)).subscribe(({ measure }: PublishMeasure) => {
        this.measureBeingSentMap[measure.id] = false;
      }),
      this.actions$.pipe(ofActionSuccessful(ShowMeasure)).subscribe((action) => {
        this.navigationService.navigateForward(
          ['measure', action.measure.type === MeasureType.Measure ? 'report' : 'report-series'],
          {
            animated: true,
            queryParams: { goBackHistory: true },
          },
        );
      }),
      this.actions$.pipe(ofActionDispatched(PublishMeasureSuccess)).subscribe(() => {
        this.loading?.dismiss();
        this.loading = undefined;
      }),
      this.actions$.pipe(ofActionDispatched(PublishMeasureProgress)).subscribe(() => {
        this.publishMeasureCountCurrent = Math.min(this.publishMeasureCountTotal, this.publishMeasureCountCurrent + 1);
        if (this.loading) {
          this.loading.message = this.getLoaderMessage();
        }
      }),
    );
  }

  showDetail(measure: Measure) {
    this.store.dispatch(new ShowMeasure(measure));
  }

  publish(measure: Measure | MeasureSeries) {
    if (this.canPublish(measure)) {
      this.alertService.show({
        header: this.translateService.instant('HISTORY.TITLE'),
        subHeader:
          measure.type === MeasureType.Measure
            ? this.translateService.instant('HISTORY.SEND.TITLE')
            : this.translateService.instant('HISTORY.SEND_SERIES.TITLE'),
        message:
          measure.type === MeasureType.Measure
            ? this.translateService.instant('HISTORY.SEND.NOTICE')
            : this.translateService.instant('HISTORY.SEND_SERIES.NOTICE'),
        backdropDismiss: false,
        buttons: [
          {
            text: this.translateService.instant('GENERAL.NO'),
          },
          {
            text: this.translateService.instant('GENERAL.YES'),
            handler: () => {
              this.publishMeasureCountCurrent = 1;
              this.publishMeasureCountTotal = 1;
              if (measure.type == MeasureType.MeasureSeries) {
                this.publishMeasureCountTotal = (measure as MeasureSeries).measures?.length;
              }
              this.loadingCtrl
                .create({
                  backdropDismiss: true,
                  message: this.getLoaderMessage(),
                })
                .then((loading) => {
                  this.loading = loading;
                  this.loading.present();
                });
              this.store.dispatch(new PublishMeasure(measure));
            },
          },
        ],
      });
    }
  }

  getLoaderMessage() {
    let progressMessage = '';
    if (this.publishMeasureCountTotal > 1) {
      progressMessage = '(' + this.publishMeasureCountCurrent + '/' + this.publishMeasureCountTotal + ')';
    }
    return this.translateService.instant('HISTORY.SENDING') + progressMessage;
  }

  canPublish(measure: Measure | MeasureSeries): boolean {
    return this.measureService.canPublishMeasure(measure);
  }

  containsMeasureSeries(measures: (Measure | MeasureSeries)[]): boolean {
    return measures.some((measure) => measure.type === MeasureType.MeasureSeries);
  }

  delete(measure: Measure | MeasureSeries) {
    this.alertService.show({
      header: this.translateService.instant('HISTORY.TITLE'),
      message:
        measure.type === MeasureType.Measure
          ? this.translateService.instant('HISTORY.DELETE.NOTICE')
          : this.translateService.instant('HISTORY.DELETE_SERIES.NOTICE'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translateService.instant('GENERAL.NO'),
        },
        {
          text: this.translateService.instant('GENERAL.YES'),
          handler: () => this.store.dispatch(new DeleteMeasure(measure)),
        },
      ],
    });
  }

  deleteAll() {
    this.alertService.show({
      header: this.translateService.instant('HISTORY.TITLE'),
      subHeader: this.translateService.instant('HISTORY.DELETE_ALL.TITLE'),
      message: this.translateService.instant('HISTORY.DELETE_ALL.NOTICE'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translateService.instant('GENERAL.NO'),
        },
        {
          text: this.translateService.instant('GENERAL.YES'),
          handler: () => this.store.dispatch(new DeleteAllMeasures()),
        },
      ],
    });
  }

  exportCsv() {
    this.measures$.pipe(take(1)).subscribe(async (measures: (Measure | MeasureSeries)[]) => {
      let csvContent = this.getCSVColumns().join(';') + '\n';
      csvContent += measures.map((measure) => this.getMeasureAsCSVLines(measure)).join('');

      const m = new Date();
      const fileName =
        'OpenRadiation_Export_' + m.getUTCFullYear() + '-' + (m.getUTCMonth() + 1) + '-' + m.getUTCDate() + '.csv';

      // Step 3 : share or download
      const canShare = await Share.canShare();

      if (canShare && canShare.value) {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        Share.share({
          text: fileName,
          title: this.translateService.instant('HISTORY.SHARE'),
          dialogTitle: this.translateService.instant('GENERAL.SHARE'),
          url: result.uri,
        });
      } else {
        // If share API not available, download CSV directly
        const encodedUri = encodeURI(csvContent);
        console.debug(csvContent);
        const hiddenElement = document.createElement('a');
        hiddenElement.href = encodedUri;
        hiddenElement.target = '_blank';
        hiddenElement.download = fileName;
        hiddenElement.click();
      }
    });
  }

  getMeasureAsCSVLines(measure: Measure | MeasureSeries): string {
    let measureLines: Measure[] = [];
    let csvContent = '';
    if (measure.type == MeasureType.Measure) {
      measureLines.push(measure);
    } else {
      measureLines = (measure as MeasureSeries).measures;
    }
    measureLines.forEach((measureLine) => {
      let csvRow = '';
      this.getCSVColumns().forEach((c) => {
        // @ts-expect-error untyped access
        const value = measureLine[c];
        csvRow += (value ? value : '') + ';';
      });
      csvContent += csvRow + '\n';
    });
    return csvContent;
  }

  getRoundedMeasure(measure: Measure | MeasureSeries) {
    const digitsAfterComa = 3;
    let measureValue = 0;
    if (measure.type == MeasureType.MeasureSeries) {
      measureValue = Math.max(...measure.measures.map((m) => m.value));
    } else {
      measureValue = measure.value;
    }
    return Math.round((measureValue + Number.EPSILON) * Math.pow(10, digitsAfterComa)) / Math.pow(10, digitsAfterComa);
  }

  canToggleSeries(measure: Measure | MeasureSeries) {
    return measure.type == MeasureType.MeasureSeries;
  }

  toggleSeriesDetail(event: Event, measure: MeasureSeries) {
    if (measure.type == MeasureType.MeasureSeries) {
      event.stopPropagation();
      if (measure.id == this.detailedSeries?.id) {
        this.detailedSeries = undefined;
      } else {
        this.detailedSeries = measure;
      }
    }
  }

  getCSVColumns() {
    return [
      'apparatusId',
      'apparatusVersion',
      'apparatusSensorType',
      'apparatusTubeType',
      'temperature',
      'value',
      'hitsNumber',
      'calibrationFunction',
      'startTime',
      'endTime',
      'latitude',
      'longitude',
      'accuracy',
      'altitude',
      'altitudeAccuracy',
      'endLatitude',
      'endLongitude',
      'endAccuracy',
      'endAltitude',
      'endAltitudeAccuracy',
      'deviceUuid',
      'devicePlatform',
      'deviceVersion',
      'deviceModel',
      'reportUuid',
      'manualReporting',
      'organisationReporting',
      'description',
      'measurementHeight',
      'enclosedObject',
      'userId',
      'measurementEnvironment',
      'rain',
      'flightNumber',
      'seatNumber',
      'windowSeat',
      'storm',
      'flightId',
      'refinedLatitude',
      'refinedLongitude',
      'refinedAltitude',
      'refinedEndLatitude',
      'refinedEndLongitude',
      'refinedEndAltitude',
      'departureTime',
      'arrivalTime',
      'airportOrigin',
      'airportDestination',
      'aircraftType',
      'firstLatitude',
      'firstLongitude',
      'midLatitude',
      'midLongitude',
      'lastLatitude',
      'lastLongitude',
      'dateAndTimeOfCreation',
      'qualification',
      'qualificationVotesNumber',
      'reliability',
      'atypical',
    ];
  }
}
