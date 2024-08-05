import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutPage } from './about.page';

import { getTestImports, getTestProviders } from '@tests/TestUtils'
import { SanitizeHtmlPipe } from '@app/components/pipes/sanitize-html/sanitize-html.pipe';

describe('AboutPage', () => {
  let component: AboutPage;
  let fixture: ComponentFixture<AboutPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AboutPage, SanitizeHtmlPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
      ,
      imports: getTestImports(),
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
