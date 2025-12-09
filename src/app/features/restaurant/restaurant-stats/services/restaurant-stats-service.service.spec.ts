import { TestBed } from '@angular/core/testing';

import { RestaurantStatsServiceService } from './restaurant-stats-service.service';

describe('RestaurantStatsServiceService', () => {
  let service: RestaurantStatsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestaurantStatsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
