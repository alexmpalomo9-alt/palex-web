import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantStatsComponent } from './restaurant-stats.component';

describe('RestaurantStatsComponent', () => {
  let component: RestaurantStatsComponent;
  let fixture: ComponentFixture<RestaurantStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
