import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalNoticePage } from './legal-notice.page';

import { getTestImports, getTestProviders } from '../../../../tests/TestUtils'
import { SanitizeHtmlPipe } from '../../../components/pipes/sanitize-html/sanitize-html.pipe';

describe('LegalNoticePage', () => {
  let component: LegalNoticePage;
  let fixture: ComponentFixture<LegalNoticePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LegalNoticePage, SanitizeHtmlPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
      ,
      imports: getTestImports(),
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalNoticePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
