import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanMeasurePage } from './scan-measure.page';

describe('ScanMeasurePage', () => {
  let component: ScanMeasurePage;
  let fixture: ComponentFixture<ScanMeasurePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScanMeasurePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanMeasurePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
