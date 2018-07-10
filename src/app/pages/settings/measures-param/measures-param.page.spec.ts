import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasuresParamPage } from './measures-param.page';

describe('MeasuresParamPage', () => {
  let component: MeasuresParamPage;
  let fixture: ComponentFixture<MeasuresParamPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MeasuresParamPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasuresParamPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
