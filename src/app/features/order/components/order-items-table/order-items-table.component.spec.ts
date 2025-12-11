import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemsTableComponent } from './order-items-table.component';

describe('OrderItemsTableComponent', () => {
  let component: OrderItemsTableComponent;
  let fixture: ComponentFixture<OrderItemsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderItemsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderItemsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
