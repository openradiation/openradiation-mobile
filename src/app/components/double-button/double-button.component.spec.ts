import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoubleButtonComponent } from './double-button.component';

describe('DoubleButtonComponent', () => {
  let component: DoubleButtonComponent;
  let fixture: ComponentFixture<DoubleButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DoubleButtonComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoubleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
