import { FlyoutService } from './flyout.service';
import { TestBed } from '@angular/core/testing';

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
