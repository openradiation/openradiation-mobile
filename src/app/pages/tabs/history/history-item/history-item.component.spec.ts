import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryItemComponent } from './history-item.component';

import { getTestImports, getTestProviders } from '@tests/TestUtils'
import { Measure } from '@app/states/measures/measure';
import { ApparatusSensorType } from '@app/states/devices/abstract-device';
import { DosePipe } from '@app/components/pipes/dose/dose.pipe';

describe('HistoryItemComponent', () => {
  let component: HistoryItemComponent;
  let fixture: ComponentFixture<HistoryItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HistoryItemComponent, DosePipe],
      imports:
        getTestImports(),
      providers:
        getTestProviders(),
    }).compileComponents();
  }));

  beforeEach(() => {
    const fakeMeasure = new Measure(
      "apparatusId",
      "apparatusVersion",
      ApparatusSensorType.Geiger,
      "apparatusTubeType",
      "deviceUUID",
      "devicePlatform",
      "deviceOsVersion",
      "deviceModel"
    );
    fakeMeasure.value = 42;
    fixture = TestBed.createComponent(HistoryItemComponent);
    component = fixture.componentInstance;
    component.measure = fakeMeasure;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
