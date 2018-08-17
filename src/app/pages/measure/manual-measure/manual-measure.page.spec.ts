import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualMeasurePage } from './manual-measure.page';

describe('ManualMeasurePage', () => {
  let component: ManualMeasurePage;
  let fixture: ComponentFixture<ManualMeasurePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManualMeasurePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualMeasurePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
