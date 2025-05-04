import { TestBed } from '@angular/core/testing';

import { FlyoutService } from './flyout.service';

describe('FlyoutService', () => {
  let service: FlyoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlyoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
