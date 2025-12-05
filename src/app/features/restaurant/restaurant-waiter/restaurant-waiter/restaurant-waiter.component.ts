import {
  Component,
  inject,
  Input,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { switchMap, map, filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import { RestaurantService } from '../../services/restaurant.service';
import { TableService } from '../../restaurant-tables/services/table.service';
import { OrdersService } from '../../../order/services/order.service';

import { Restaurant } from '../../model/restaurant.model';
import { Table } from '../../restaurant-tables/model/tables.model';
import { Order, OrderStatus } from '../../../order/models/order.model';

@Component({
  selector: 'app-restaurant-waiter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-waiter.component.html',
  styleUrls: ['./restaurant-waiter.component.scss'],
})
export class RestaurantWaiterComponent implements OnInit {
  @Input() restaurant: Restaurant | null = null;

  private route = inject(ActivatedRoute);
  private restaurantService = inject(RestaurantService);
  private tableService = inject(TableService);
  private orderService = inject(OrdersService);

  restaurantId!: string;

  tables = signal<Table[] | null>(null);
  ordersSignals: Record<string, Signal<Order[] | null>> = {};

  ngOnInit() {
    if (this.restaurant) {
      // Si ya recibimos restaurant via Input
      this.restaurantId = this.restaurant.restaurantId!;
      this.loadTables();
    } else {
      // Si no, obtener restaurantId desde la ruta
      this.route.parent?.paramMap
        .pipe(
          map((pm) => pm.get('restaurantId')),
          filter(Boolean)
        )
        .subscribe((rid) => {
          this.restaurantId = rid!;
          this.loadRestaurant();
          this.loadTables();
        });
    }
  }
  createOrderForTable(table: any) {
    console.log('🟦 Crear pedido para mesa:', table);

    this.orderService
      .createOrder(this.restaurantId, table.tableId, table.number)
      .then((orderId) => {
        console.log('🟢 Pedido creado con ID:', orderId);

        // Mostrar notificación
        alert(`Pedido creado correctamente (ID: ${orderId})`);
      })
      .catch((error) => {
        console.error('🔴 Error al crear pedido:', error);

        // Mostrar error al usuario (puede ser mat-snackbar)
        alert('Error: ' + error.message);
      });
  }

  private loadRestaurant() {
    if (!this.restaurantId) return;
    this.restaurantService
      .getRestaurantBySlug(this.restaurantId)
      .subscribe((r) => (this.restaurant = r));
  }

  private loadTables() {
    if (!this.restaurantId) return;
    this.tableService
      .getTablesByRestaurant(this.restaurantId)
      .subscribe((tables) => {
        this.tables.set(tables);

        // Inicializar signals de pedidos por mesa
        for (const table of tables) {
          if (!this.ordersSignals[table.tableId!]) {
            this.ordersSignals[table.tableId!] = toSignal(
              this.orderService.getActiveOrderByTable(
                this.restaurantId,
                table.tableId!
              ),
              { initialValue: [] }
            );
          }
        }
      });
  }

  getOrdersSignal(tableId: string): Signal<Order[] | null> | undefined {
    return this.ordersSignals[tableId];
  }

  approveOrder(order: Order) {
    if (!this.restaurantId) return;
    this.orderService.updateOrderStatus(
      this.restaurantId,
      order.orderId!,
      'approved',
      'waiter'
    );
  }

  closeOrder(order: Order) {
    if (!this.restaurantId) return;
    this.orderService.closeOrder(
      this.restaurantId,
      order.orderId!,
      order.tableId
    );
  }
}
