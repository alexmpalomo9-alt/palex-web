import { Component, Input } from '@angular/core';
import { OrderItem } from '../../../order/models/order.model';
import { OrdersService } from '../../../order/services/order.service';
import { Restaurant } from '../../model/restaurant.model';
import { ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { SharedModule } from '../../../../shared/shared.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-restaurant-orders',
  imports: [SharedModule, FormsModule],
  templateUrl: './restaurant-orders.component.html',
  styleUrl: './restaurant-orders.component.scss',
})
export class RestaurantOrdersComponent {
  @Input() restaurant: Restaurant | null = null;

  tableId = '0YI2nDnE1UFzTQXVTPIx';
  tableNumber = 1;

  currentOrderId: string | null = null;

  selectedItem: OrderItem = {
    productId: '',
    name: '',
    quantity: 1,
    price: 0,
    subtotal: 0,
  };

  constructor(
    private ordersService: OrdersService,
    private route: ActivatedRoute,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit() {
    const slug = this.route.parent?.snapshot.paramMap.get('restaurantId');
    if (!slug) return;

    this.restaurantService.getRestaurantBySlug(slug).subscribe((restaurant) => {
      if (!restaurant) return;

      this.restaurant = restaurant;
    });
  }

  // ------------------------------------------------------------
  // Crear pedido o recuperar pedido activo
  // ------------------------------------------------------------
  async onCreateOrGetOrder() {
    if (!this.restaurant) {
      alert('Restaurante no cargado');
      return;
    }

    try {
      const orderId = await this.ordersService.createOrGetActiveOrder(
        this.restaurant.restaurantId,
        this.tableId,
        this.tableNumber
      );

      this.currentOrderId = orderId;

      console.log('Pedido activo:', orderId);
      alert('Pedido activo: ' + orderId);
    } catch (err) {
      console.error('Error creando pedido:', err);
      alert('Error: ' + (err as any).message);
    }
  }

  // ------------------------------------------------------------
  // Agregar ítem al pedido
  // ------------------------------------------------------------
  async onAddItem() {
    if (!this.currentOrderId) {
      alert('No hay pedido activo');
      return;
    }

    if (!this.restaurant) {
      alert('Restaurante no cargado');
      return;
    }

    try {
      await this.ordersService.addItemWithStatusCheck(
        this.restaurant.restaurantId,
        this.currentOrderId,
        {
          ...this.selectedItem,
          subtotal: this.selectedItem.price * this.selectedItem.quantity,
        }
      );

      alert('Item agregado');
      console.log('Item agregado:', this.selectedItem);
    } catch (err) {
      console.error('Error agregando item:', err);
      alert('Error: ' + (err as any).message);
    }
  }
}
