import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceParamPage } from './device-param.page';

describe('DeviceParamPage', () => {
  let component: DeviceParamPage;
  let fixture: ComponentFixture<DeviceParamPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceParamPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceParamPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
