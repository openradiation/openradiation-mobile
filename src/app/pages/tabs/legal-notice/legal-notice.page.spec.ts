import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalNoticePage } from './legal-notice.page';

describe('LegalNoticePage', () => {
  let component: LegalNoticePage;
  let fixture: ComponentFixture<LegalNoticePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LegalNoticePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
