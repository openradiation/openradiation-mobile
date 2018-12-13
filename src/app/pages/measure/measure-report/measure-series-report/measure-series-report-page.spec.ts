import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureSeriesReportPage } from './measure-series-report-page';

describe('MeasureSeriesReportPage', () => {
  let component: MeasureSeriesReportPage;
  let fixture: ComponentFixture<MeasureSeriesReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MeasureSeriesReportPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasureSeriesReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
