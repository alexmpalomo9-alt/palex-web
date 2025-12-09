import { TestBed } from '@angular/core/testing';

import { OrderDialogService } from './order-dialog.service';

describe('OrderDialogService', () => {
  let service: OrderDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
