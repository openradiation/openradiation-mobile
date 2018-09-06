import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureStepsPage } from './measure-steps.page';

describe('MeasureStepsPage', () => {
  let component: MeasureStepsPage;
  let fixture: ComponentFixture<MeasureStepsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MeasureStepsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasureStepsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
