import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDialogFooterComponent } from './order-dialog-footer.component';

describe('OrderDialogFooterComponent', () => {
  let component: OrderDialogFooterComponent;
  let fixture: ComponentFixture<OrderDialogFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDialogFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDialogFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
