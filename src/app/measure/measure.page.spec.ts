import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurePage } from './measure.page';

describe('MeasurePage', () => {
  let component: MeasurePage;
  let fixture: ComponentFixture<MeasurePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MeasurePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasurePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
