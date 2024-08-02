import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogInPage } from './log-in.page';

import { getTestImports, getTestProviders } from '../../../../../tests/TestUtils'
import { SanitizeHtmlPipe } from '../../../../components/pipes/sanitize-html/sanitize-html.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('LogInPage', () => {
  let component: LogInPage;
  let fixture: ComponentFixture<LogInPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LogInPage, SanitizeHtmlPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
      ,
      imports: [
        ...getTestImports(),
        // Provides form
        FormsModule,
        ReactiveFormsModule
      ],
      providers: getTestProviders()
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogInPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
