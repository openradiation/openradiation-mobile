import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaneModePage } from './plane-mode.page';

describe('MeasuresParamPage', () => {
  let component: PlaneModePage;
  let fixture: ComponentFixture<PlaneModePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlaneModePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaneModePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
