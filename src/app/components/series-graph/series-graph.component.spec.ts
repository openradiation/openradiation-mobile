import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SeriesGraphComponent } from './series-graph.component';

import { getTestImports, getTestProviders } from '../../../tests/TestUtils'
import { PlotlyViaCDNModule } from 'angular-plotly.js'
import { Measure, MeasureSeries, MeasureSeriesParams, MeasureSeriesParamsSelected } from '../../states/measures/measure';
import { ApparatusSensorType } from '../../states/devices/abstract-device';
PlotlyViaCDNModule.setPlotlyVersion('latest');

describe('SeriesGraphComponent', () => {
  let component: SeriesGraphComponent;
  let fixture: ComponentFixture<SeriesGraphComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SeriesGraphComponent]
      ,
      imports: [
        ...getTestImports(),
        PlotlyViaCDNModule
      ],
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    const measureSeriesParams: MeasureSeriesParams = { seriesDurationLimit: 42, measureDurationLimit: 42, measureHitsLimit: 42, paramSelected: MeasureSeriesParamsSelected.measureDurationLimit }
    const fakeMeasureSeries = new MeasureSeries(measureSeriesParams, "fakeUUID");
    const fakeMeasure = new Measure(
      "apparatusId",
      "apparatusVersion",
      ApparatusSensorType.Geiger,
      "apparatusTubeType",
      "deviceUUID",
      "devicePlatform",
      "deviceOsVersion",
      "deviceModel"
    );
    fakeMeasure.value = 42;
    fakeMeasureSeries.measures = [fakeMeasure];
    fixture = TestBed.createComponent(SeriesGraphComponent);
    component = fixture.componentInstance;
    component.seriesMeasure = fakeMeasureSeries;

    const fakeBarPlot = {
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
          title: "MEASURES.DOSE_RATE_UNIT"
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
        "locale": "fr"
      }
    };
    component.barPlot = fakeBarPlot;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
