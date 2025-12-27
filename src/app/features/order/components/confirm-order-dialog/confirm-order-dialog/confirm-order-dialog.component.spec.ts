import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmOrderDialogComponent } from './confirm-order-dialog.component';

describe('ConfirmOrderDialogComponent', () => {
  let component: ConfirmOrderDialogComponent;
  let fixture: ComponentFixture<ConfirmOrderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmOrderDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
