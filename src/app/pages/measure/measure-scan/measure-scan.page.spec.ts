import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MeasureScanPage } from './measure-scan.page';

describe('MeasureScanPage', () => {
  let component: MeasureScanPage;
  let fixture: ComponentFixture<MeasureScanPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MeasureScanPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
