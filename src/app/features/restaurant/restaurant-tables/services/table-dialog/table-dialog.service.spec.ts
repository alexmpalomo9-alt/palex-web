import { TestBed } from '@angular/core/testing';

import { TableDialogService } from './table-dialog.service';

describe('TableDialogService', () => {
  let service: TableDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
