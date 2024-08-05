import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoComponent } from './photo.component';

import { getTestImports, getTestProviders } from '@tests/TestUtils'

describe('TagListComponent', () => {
  let component: PhotoComponent;
  let fixture: ComponentFixture<PhotoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PhotoComponent]
      ,
      imports: getTestImports(),
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
