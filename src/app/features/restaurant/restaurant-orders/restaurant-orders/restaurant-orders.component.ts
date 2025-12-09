import { Component, Input } from '@angular/core';
import { OrderItem } from '../../../order/models/order.model';
import { Restaurant } from '../../model/restaurant.model';
import { ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { SharedModule } from '../../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../order/services/order-service/order.service';

@Component({
  selector: 'app-restaurant-orders',
  standalone: true,
  imports: [SharedModule, FormsModule],
  templateUrl: './restaurant-orders.component.html',
  styleUrls: ['./restaurant-orders.component.scss'],
})
export class RestaurantOrdersComponent {
  @Input() restaurant: Restaurant | null = null;

  tableId = '0YI2nDnE1UFzTQXVTPIx';
  tableNumber = 1;

  currentOrderId: string | null = null;
  items: OrderItem[] = [];

  selectedItem: Partial<OrderItem> = {
    productId: '',
    name: '',
    qty: 1,
    price: 0,
    subtotal: 0,
  };

  constructor(
    private orderService: OrderService,
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
  // Crear pedido borrador simple
  // ------------------------------------------------------------
  async onCreateOrGetOrder() {
    if (!this.restaurant) {
      alert('Restaurante no cargado');
      return;
    }

    try {
      const orderId = await this.orderService.createOrder(
        this.restaurant.restaurantId,
        {
          tableId: this.tableId,
          tableNumber: this.tableNumber,
          createdBy: 'mozo-demo',
        }
      );

      this.currentOrderId = orderId;
      this.items = [];

      console.log('Borrador creado:', orderId);
      alert('Borrador creado: ' + orderId);
    } catch (err) {
      console.error('Error creando pedido:', err);
      alert('Error: ' + (err as any).message);
    }
  }

  // ------------------------------------------------------------
  // Agregar item al pedido
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
      const newItem: OrderItem = {
        productId: this.selectedItem.productId!,
        name: this.selectedItem.name!,
        price: this.selectedItem.price!,
        qty: this.selectedItem.qty!,
        subtotal: this.selectedItem.price! * this.selectedItem.qty!,
        position: this.items.length,
        notes: this.selectedItem.notes ?? '',
      };

      this.items.push(newItem);

      // Actualiza todo el pedido con los items
      await this.orderService.updateOrder(
        this.restaurant.restaurantId,
        this.currentOrderId,
        this.items,
        '', // notas generales opcionales
        'mozo-demo'
      );

      alert('Item agregado');
      console.log('Item agregado:', newItem);

      // Limpiar form
      this.selectedItem = { productId: '', name: '', qty: 1, price: 0, subtotal: 0 };
    } catch (err) {
      console.error('Error agregando item:', err);
      alert('Error: ' + (err as any).message);
    }
  }

  // Total dinámico
  getTotal() {
    return this.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  }
}
