import { TestBed } from '@angular/core/testing';

import { RestaurantDialogService } from './restaurant-dialog.service';

describe('RestaurantDialogService', () => {
  let service: RestaurantDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestaurantDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
