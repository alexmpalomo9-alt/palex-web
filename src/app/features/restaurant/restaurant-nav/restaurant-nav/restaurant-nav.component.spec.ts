import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantNavComponent } from './restaurant-nav.component';

describe('RestaurantNavComponent', () => {
  let component: RestaurantNavComponent;
  let fixture: ComponentFixture<RestaurantNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
