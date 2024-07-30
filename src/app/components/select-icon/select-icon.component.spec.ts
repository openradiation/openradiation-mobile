import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectIconComponent } from './select-icon.component';

import { getTestImports, getTestProviders } from '../../../tests/TestUtils'

describe('SelectIconComponent', () => {
  let component: SelectIconComponent;
  let fixture: ComponentFixture<SelectIconComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SelectIconComponent]
      ,
      imports: getTestImports(),
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
