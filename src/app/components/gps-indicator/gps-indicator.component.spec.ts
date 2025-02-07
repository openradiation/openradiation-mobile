import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { GpsIndicatorComponent } from './gps-indicator.component';

import { getTestImports, getTestProviders } from '@tests/TestUtils'

describe('GpsIndicatorComponent', () => {
  let component: GpsIndicatorComponent;
  let fixture: ComponentFixture<GpsIndicatorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GpsIndicatorComponent]
      ,
      imports: getTestImports(),
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GpsIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
