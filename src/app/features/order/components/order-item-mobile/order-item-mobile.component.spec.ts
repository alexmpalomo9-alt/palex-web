import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemMobileComponent } from './order-item-mobile.component';

describe('OrderItemMobileComponent', () => {
  let component: OrderItemMobileComponent;
  let fixture: ComponentFixture<OrderItemMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderItemMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderItemMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
