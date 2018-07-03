import { inject, TestBed } from '@angular/core/testing';

import { TabsGuard } from './tabs.guard';

describe('TabsGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TabsGuard]
    });
  });

  it('should ...', inject([TabsGuard], (guard: TabsGuard) => {
    expect(guard).toBeTruthy();
  }));
});
