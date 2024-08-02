import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SeriesGraphComponent } from './series-graph.component';

import { getTestImports, getTestProviders } from '../../../tests/TestUtils'

// FIXME as soon as we import PlolyModule here, we have a polyfill error in tests
// import { PlotlyModule } from 'angular-plotly.js';
// import * as PlotlyJS from 'plotly.js';
// PlotlyModule.plotlyjs = PlotlyJS;

describe('SeriesGraphComponent', () => {
  let component: SeriesGraphComponent;
  let fixture: ComponentFixture<SeriesGraphComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SeriesGraphComponent]
      ,
      imports: [
        ...getTestImports(),
        // PlotlyModule
      ],
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeriesGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
