import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundButtonComponent } from './round-button.component';

describe('RoundButtonComponent', () => {
  let component: RoundButtonComponent;
  let fixture: ComponentFixture<RoundButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RoundButtonComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
