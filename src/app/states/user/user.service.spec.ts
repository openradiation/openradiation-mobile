import { inject, TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { provideHttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { getTestImports } from '@tests/TestUtils';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: getTestImports(),
      providers: [UserService, provideHttpClient(), DatePipe]
    });
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
});
