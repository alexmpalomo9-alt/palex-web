import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDialogBaseComponent } from './order-dialog-base.component';

describe('OrderDialogBaseComponent', () => {
  let component: OrderDialogBaseComponent;
  let fixture: ComponentFixture<OrderDialogBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDialogBaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDialogBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
