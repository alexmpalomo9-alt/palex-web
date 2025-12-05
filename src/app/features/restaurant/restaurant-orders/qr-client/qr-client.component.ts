import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order, OrderItem } from '../../../order/models/order.model';
import { OrdersService } from '../../../order/services/order.service';
import { Table } from '../../restaurant-tables/model/tables.model';
import { TableService } from '../../restaurant-tables/services/table.service';
import { MenuService } from '../../services/menu/menu.service';

@Component({
  selector: 'app-qr-client',
  templateUrl: './qr-client.component.html',
  styleUrls: ['./qr-client.component.scss'],
})
export class QrClientComponent implements OnInit {
  restaurantId!: string;
  qrSlug!: string;

  table: Table | null = null;
  order: Order | null = null;

  menuItems: any[] = [];

  loading: boolean = false; //
  constructor(
    private route: ActivatedRoute,
    private tablesSvc: TableService,
    private ordersSvc: OrdersService,
    private menuSvc: MenuService
  ) {}

  async ngOnInit() {
    this.loading = true; // activar spinner
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantId') || '';
    this.qrSlug = this.route.snapshot.paramMap.get('qrSlug') || '';

    if (!this.restaurantId || !this.qrSlug) {
      this.loading = false;
      return;
    }

    try {
      // traer la mesa según QR
      this.table = await this.tablesSvc.getTableBySlug(
        this.restaurantId,
        this.qrSlug
      );

      if (!this.table) {
        console.error('Mesa no encontrada');
        return;
      }

      // si hay pedido activo
      if (this.table.currentOrderId) {
        this.order = await this.ordersSvc.getOrderSnapshot(
          this.restaurantId,
          this.table.currentOrderId
        );
      }

      // cargar menú completo
      this.menuItems = await this.menuSvc.getMenuByRestaurant(
        this.restaurantId
      );
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      this.loading = false; // desactivar spinner
    }
  }

  async addItem(product: {
    productId: string;
    name: string;
    price: number;
    categoryId: string;
  }) {
    if (!this.table) return;

    const newItem: OrderItem = {
      productId: product.productId,
      productName: product.name,
      price: product.price,
      quantity: 1,
      subtotal: product.price,
      categoryId: product.categoryId, // obligatorio según modelo
    };

    if (this.order) {
      await this.ordersSvc.addItem(
        this.restaurantId,
        this.order.orderId,
        newItem
      );
      this.order.items.push(newItem);
      this.order.total += newItem.subtotal;
    } else {
      const orderId = await this.ordersSvc.createOrder(
        this.restaurantId,
        this.table,
        [newItem]
      );
      this.order = await this.ordersSvc.getOrderSnapshot(
        this.restaurantId,
        orderId
      );
    }
  }

  async confirmOrder() {
    if (!this.order) return;

    await this.ordersSvc.updateStatus(
      this.restaurantId,
      this.order.orderId,
      'preparing' // status válido
    );

    this.order.status = 'preparing';
  }
}
