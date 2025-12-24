import { TestBed } from '@angular/core/testing';

import { UiFeedbackService } from './ui-feedback.service';

describe('UiFeedbackService', () => {
  let service: UiFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiFeedbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
