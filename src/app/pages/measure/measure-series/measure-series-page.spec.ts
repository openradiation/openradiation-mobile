import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureSeriesPage } from './measure-series-page';

describe('MeasureSeriesPage', () => {
  let component: MeasureSeriesPage;
  let fixture: ComponentFixture<MeasureSeriesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MeasureSeriesPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasureSeriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
