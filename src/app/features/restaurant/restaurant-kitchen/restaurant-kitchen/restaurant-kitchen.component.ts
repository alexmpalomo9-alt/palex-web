import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedModule } from '../../../../shared/shared.module';
import { KitchenOrder, KitchenFacade } from '../facade/kitchen-facade.service';
import { ActivatedRoute } from '@angular/router';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';

@Component({
  selector: 'app-restaurant-kitchen',
  templateUrl: './restaurant-kitchen.component.html',
  styleUrls: ['./restaurant-kitchen.component.scss'],
  imports: [SharedModule],
})
export class RestaurantKitchenComponent implements OnInit {
  activeOrders$!: Observable<KitchenOrder[]>;
  restaurantId!: string;
  @Input() restaurant: Restaurant | null = null;

  constructor(
    private kitchenFacade: KitchenFacade,
    private route: ActivatedRoute,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit() {
    // Obtenemos el 'restaurantId' desde el ancestro correcto
    const restaurantId =
      this.route.snapshot.parent?.paramMap.get('restaurantId');

    if (!restaurantId) {
      console.error('No se encontró restaurantId en la URL');
      return;
    }

    this.restaurantId = restaurantId; // guardar para usarlo más adelante

    this.restaurantService
      .getRestaurantBySlug(restaurantId)
      .subscribe((restaurant) => {
        if (!restaurant) return;

        this.restaurant = restaurant;

        this.activeOrders$ = this.kitchenFacade.getActiveOrders(
          this.restaurant.restaurantId!
        );
      });
  }
  getOrderStatusLabel(orderId: string) {
    return this.kitchenFacade.getOrderStatusLabel(orderId);
  }
}
