import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceParamPage } from './device-param.page';
import { getTestImports, getTestProviders } from '@tests/TestUtils'

describe('DeviceParamPage', () => {
  let component: DeviceParamPage;
  let fixture: ComponentFixture<DeviceParamPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceParamPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: getTestImports(),
      providers: getTestProviders()
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
