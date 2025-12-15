import { TestBed } from '@angular/core/testing';

import { KitchenFacadeService } from './kitchen-facade.service';

describe('KitchenFacadeService', () => {
  let service: KitchenFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KitchenFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
