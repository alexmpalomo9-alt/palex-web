import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantWaiterComponent } from './restaurant-waiter.component';

describe('RestaurantWaiterComponent', () => {
  let component: RestaurantWaiterComponent;
  let fixture: ComponentFixture<RestaurantWaiterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantWaiterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantWaiterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
