import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTestComponentComponent } from './order-test-component.component';

describe('OrderTestComponentComponent', () => {
  let component: OrderTestComponentComponent;
  let fixture: ComponentFixture<OrderTestComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTestComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTestComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
