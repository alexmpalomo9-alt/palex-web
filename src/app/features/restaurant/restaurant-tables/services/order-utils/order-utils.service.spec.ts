import { TestBed } from '@angular/core/testing';

import { OrderUtilsService } from './order-utils.service';

describe('OrderUtilsService', () => {
  let service: OrderUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
