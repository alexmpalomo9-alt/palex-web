import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantKitchenComponent } from './restaurant-kitchen.component';

describe('RestaurantKitchenComponent', () => {
  let component: RestaurantKitchenComponent;
  let fixture: ComponentFixture<RestaurantKitchenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantKitchenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantKitchenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
