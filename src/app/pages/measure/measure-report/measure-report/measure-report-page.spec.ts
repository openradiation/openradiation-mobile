import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureReportPage } from './measure-report-page';

import { getTestImports, getTestProviders } from '@tests/TestUtils'

describe('MeasureReportPage', () => {
  let component: MeasureReportPage;
  let fixture: ComponentFixture<MeasureReportPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MeasureReportPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
      ,
      imports: getTestImports(),
      providers: getTestProviders()
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
