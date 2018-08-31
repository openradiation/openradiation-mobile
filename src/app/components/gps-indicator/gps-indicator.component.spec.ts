import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GpsIndicatorComponent } from './gps-indicator.component';

describe('GpsIndicatorComponent', () => {
  let component: GpsIndicatorComponent;
  let fixture: ComponentFixture<GpsIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GpsIndicatorComponent]
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
