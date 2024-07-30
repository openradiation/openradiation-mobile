import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SeriesGraphComponent } from './series-graph.component';

import { getTestImports, getTestProviders } from '../../../tests/TestUtils'

describe('SeriesGraphComponent', () => {
  let component: SeriesGraphComponent;
  let fixture: ComponentFixture<SeriesGraphComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SeriesGraphComponent]
      ,
      imports: getTestImports(),
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeriesGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
