import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureReportPage } from './measure-report-page';

describe('MeasureReportPage', () => {
  let component: MeasureReportPage;
  let fixture: ComponentFixture<MeasureReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MeasureReportPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasureReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
