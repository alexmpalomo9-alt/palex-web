import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantProductsComponent } from './restaurant-products.component';

describe('RestaurantProductsComponent', () => {
  let component: RestaurantProductsComponent;
  let fixture: ComponentFixture<RestaurantProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
