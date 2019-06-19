import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SeriesGraphComponent } from './series-graph.component';

describe('SeriesGraphComponent', () => {
  let component: SeriesGraphComponent;
  let fixture: ComponentFixture<SeriesGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SeriesGraphComponent]
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
