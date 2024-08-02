import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagListComponent } from './tag-list.component';

import { getTestImports, getTestProviders } from '../../../tests/TestUtils'
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('TagListComponent', () => {
  let component: TagListComponent;
  let fixture: ComponentFixture<TagListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TagListComponent],
      imports: [
        getTestImports(),
        ReactiveFormsModule,
        FormsModule
      ],
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
