import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MeasureScanPage } from './measure-scan.page';

import { getTestImports, getTestProviders } from '@tests/TestUtils'

describe('MeasureScanPage', () => {
  let component: MeasureScanPage;
  let fixture: ComponentFixture<MeasureScanPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MeasureScanPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
      ,
      imports: getTestImports(),
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasureScanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
