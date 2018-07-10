import { inject, TestBed } from '@angular/core/testing';

import { MeasuresService } from './measures.service';

describe('MeasuresService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeasuresService]
    });
  });

  it('should be created', inject([MeasuresService], (service: MeasuresService) => {
    expect(service).toBeTruthy();
  }));
});
