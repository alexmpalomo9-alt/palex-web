import { Component } from '@angular/core';
import { OrderItem } from '../../order/models/order.model';
import { OrdersService } from '../../order/services/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-test-component',
  imports: [CommonModule, FormsModule   ],
  templateUrl: './order-test-component.component.html',
  styleUrl: './order-test-component.component.scss'
})
export class OrderTestComponentComponent {

  restaurantId = 'Yp6laLZOjJAEb28eCiaB';
  tableId = '0YI2nDnE1UFzTQXVTPIx';
  tableNumber = 1;

  currentOrderId: string | null = null;

  selectedItem: OrderItem = {
    productId: '',
    productName: '',
    quantity: 1,
    price: 0,
    subtotal: 0
  };

  constructor(private ordersService: OrdersService) {}

  // ------------------------------------------------------------
  // Crear pedido o recuperar pedido activo
  // ------------------------------------------------------------
  async onCreateOrGetOrder() {
    try {
      const orderId = await this.ordersService.createOrGetActiveOrder(
        this.restaurantId,
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

    try {
      await this.ordersService.addItemWithStatusCheck(
        this.restaurantId,
        this.currentOrderId,
        this.selectedItem
      );

      alert('Item agregado');
      console.log('Item agregado:', this.selectedItem);

    } catch (err) {
      console.error('Error agregando item:', err);
      alert('Error: ' + (err as any).message);
    }
  }
}
