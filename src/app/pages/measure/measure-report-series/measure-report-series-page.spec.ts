import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureReportSeriesPage } from './measure-report-series-page';

describe('MeasureReportSeriesPage', () => {
  let component: MeasureReportSeriesPage;
  let fixture: ComponentFixture<MeasureReportSeriesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MeasureReportSeriesPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasureReportSeriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
