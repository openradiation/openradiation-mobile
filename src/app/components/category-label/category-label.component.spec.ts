import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryLabelComponent } from './category-label.component';

import { getTestImports, getTestProviders } from '../../../tests/TestUtils'

describe('CategoryLabelComponent', () => {
  let component: CategoryLabelComponent;
  let fixture: ComponentFixture<CategoryLabelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryLabelComponent]
      ,
      imports: getTestImports(),
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
