import { Component, Input, OnChanges, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MeasureSeries } from '@app/states/measures/measure';

import Figure = Plotly.Figure;
import { Store } from '@ngxs/store';
import { PlotlyService } from 'angular-plotly.js';
import { Plotly } from 'angular-plotly.js/lib/plotly.interface';
import * as PlotlyFR from 'plotly.js/lib/locales/fr.js';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { UserState } from '@app/states/user/user.state';

@Component({
  selector: 'app-series-graph',
  template: '<plotly-plot [data]="barPlot.data" [layout]="barPlot.layout" [config]="barPlot.frames"></plotly-plot>'
})
export class SeriesGraphComponent implements OnChanges {
  language$: Observable<string | undefined> = inject(Store).select(UserState.language);

  @Input()
  seriesMeasure: MeasureSeries;

  barPlot: Figure;

  constructor(private plotlyService: PlotlyService, private translateService: TranslateService) {
    this.plotlyService.getPlotly().then(plotlyInstance => {
      plotlyInstance.register(PlotlyFR);
    });
    this.language$.pipe(take(1)).subscribe(locale => {
      this.barPlot = {
        data: [],
        layout: {
          showlegend: false,
          dragmode: false,
          width: window.innerWidth,
          height: window.innerHeight * (1 - 0.7),
          bargap: 0,
          plot_bgcolor: '#3c1d7c',
          paper_bgcolor: '#3c1d7c',
          xaxis: {
            linecolor: '#ffffff',
            gridcolor: 'rgba(255,255,255,0.3)',
            type: 'date',
            fixedrange: true
          },
          yaxis: {
            linecolor: '#ffffff',
            gridcolor: 'rgba(255,255,255,0.3)',
            rangemode: 'nonnegative',
            fixedrange: true,
            title: this.translateService.instant('MEASURES.DOSE_RATE_UNIT')
          },
          font: {
            color: '#ffffff'
          },
          margin: {
            l: 40,
            r: 20,
            t: 20,
            b: 50
          }
        },
        frames: {
          displayModeBar: false,
          locale
        }
      };
    });
  }

  ngOnChanges() {
    const currentSeries = this.seriesMeasure;
    if (currentSeries) {
      const x = currentSeries.measures.map(measure => new Date((measure.startTime + measure.endTime!) / 2));
      const y = currentSeries.measures.map(measure => measure.value.toFixed(3));
      const hovertext = y.map(value => `${value} ${this.translateService.instant('MEASURES.DOSE_RATE_UNIT')}`);
      const width = currentSeries.measures.map(measure => measure.endTime! - measure.startTime);
      const color = currentSeries.measures.map((measure, i) => (i % 2 === 0 ? '#81cfed' : '#00a0dd'));
      this.barPlot.data = [
        {
          x,
          y,
          width,
          hovertext,
          hoverinfo: 'text',
          type: 'bar',
          marker: {
            color
          }
        }
      ];
      this.barPlot.layout = {
        ...this.barPlot.layout,
        xaxis: {
          ...this.barPlot.layout.xaxis,
          range:
            currentSeries.measures.length > 0
              ? [
                new Date(currentSeries.measures[0].startTime),
                new Date(currentSeries.measures[currentSeries.measures.length - 1].endTime!)
              ]
              : [new Date(), new Date(new Date().getTime() + 60000)]
        },
        yaxis: {
          ...this.barPlot.layout.yaxis,
          autorange: currentSeries.measures.length > 0,
          range: currentSeries.measures.length > 0 ? null : [0, 1]
        }
      };
    }
  }
}
