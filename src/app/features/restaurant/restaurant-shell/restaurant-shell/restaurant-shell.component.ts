import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantHeaderComponent } from '../../restaurant-header/restaurant-header/restaurant-header.component';
import { RestaurantNavComponent } from '../../restaurant-nav/restaurant-nav/restaurant-nav.component';
import { RestaurantService } from '../../services/restaurant.service';
import { SharedModule } from '../../../../shared/shared.module';
import { RestaurantStaffComponent } from '../../restaurant-staff/restaurant-staff/restaurant-staff.component';

@Component({
  selector: 'app-restaurant-shell',
  standalone: true,
  imports: [
    RestaurantNavComponent,
      SharedModule,
    RouterModule,
  ],
  templateUrl: './restaurant-shell.component.html',
  styleUrls: ['./restaurant-shell.component.scss'],
})
export class RestaurantShellComponent implements OnInit {
  restaurant: any;  // O el tipo adecuado de tu restaurante

  constructor(private route: ActivatedRoute, private restaurantService: RestaurantService) {}

ngOnInit() {
  this.route.paramMap.subscribe((params) => {
    const slug = params.get('slug');
    if (!slug) return;

    this.restaurantService.getRestaurantBySlug(slug).subscribe((res) => {
      this.restaurant = res[0] ?? null;

      console.log("RESTAURANT CARGADO EN PADRE:", this.restaurant);
      console.log("RESTAURANT ID EN PADRE:", this.restaurant?.restaurantId);
    });
  });
}
}
