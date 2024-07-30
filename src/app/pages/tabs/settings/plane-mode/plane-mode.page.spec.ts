import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaneModePage } from './plane-mode.page';

import { getTestImports, getTestProviders } from '../../../../../tests/TestUtils'
import { SanitizeHtmlPipe } from '../../../../components/pipes/sanitize-html/sanitize-html.pipe';

describe('MeasuresParamPage', () => {
  let component: PlaneModePage;
  let fixture: ComponentFixture<PlaneModePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlaneModePage, SanitizeHtmlPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
      ,
      imports: getTestImports(),
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaneModePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
