import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantTablesCardComponent } from './restaurant-tables-card.component';

describe('RestaurantTablesCardComponent', () => {
  let component: RestaurantTablesCardComponent;
  let fixture: ComponentFixture<RestaurantTablesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantTablesCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantTablesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
