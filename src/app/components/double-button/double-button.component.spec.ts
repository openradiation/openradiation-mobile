import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoubleButtonComponent } from './double-button.component';

import { getTestImports, getTestProviders } from '../../../tests/TestUtils'

describe('DoubleButtonComponent', () => {
  let component: DoubleButtonComponent;
  let fixture: ComponentFixture<DoubleButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DoubleButtonComponent]
      ,
      imports: getTestImports(),
      providers: getTestProviders()
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
