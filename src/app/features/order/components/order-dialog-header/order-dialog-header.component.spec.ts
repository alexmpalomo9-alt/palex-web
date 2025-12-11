import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDialogHeaderComponent } from './order-dialog-header.component';

describe('OrderDialogHeaderComponent', () => {
  let component: OrderDialogHeaderComponent;
  let fixture: ComponentFixture<OrderDialogHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDialogHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDialogHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
