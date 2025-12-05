import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Order } from '../../../order/models/order.model';
import { OrdersService } from '../../../order/services/order.service';
import { SharedModule } from '../../../../shared/shared.module';
import { Restaurant } from '../../model/restaurant.model';
import { ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';

@Component({
  selector: 'app-restaurant-kitchen',
  imports: [SharedModule],
  templateUrl: './restaurant-kitchen.component.html',
  styleUrl: './restaurant-kitchen.component.scss'
})
export class RestaurantKitchenComponent {
  @Input() restaurant: Restaurant | null = null;

  private orderService = inject(OrdersService);
    private restaurantService = inject(RestaurantService);
  private route = inject(ActivatedRoute);


  ngOnInit() {
  this.route.parent?.paramMap.subscribe(params => {
    const slug = params.get('restaurantId');
    if (!slug) return;

    this.restaurantService.getRestaurantBySlug(slug).subscribe(restaurant => {
      if (!restaurant) return;

      this.restaurant = restaurant;
      console.log(this.restaurant)
      
    });
  });
}
  // // 🔥 Pedidos para cocina (approved + preparing)
  // kitchenOrders = toSignal(
  //   this.orderService.getKitchenOrders(),
  //   { initialValue: [] as Order[] }
  // );

  // // ----------------------------------------------------------------
  // // Cambiar estados
  // // ----------------------------------------------------------------

  // markAsPreparing(order: Order) {
  //   this.orderService.updateOrderStatus(order.orderId!, 'preparing', 'kitchen');
  // }

  // markAsReady(order: Order) {
  //   this.orderService.updateOrderStatus(order.orderId!, 'ready', 'kitchen');
  // }
}
