import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SharedModule } from '../../../../shared/shared.module';
import { Order, OrderItem } from '../../../order/models/order.model';
import { OrdersService } from '../../../order/services/order.service';
import { MenuDialogComponent } from '../../restaurant-menu/menu-dialog/menu-dialog.component';
import { Product } from '../../../../products/model/product.model';
import { DialogService } from '../../../../core/services/dialog.service';

@Component({
  selector: 'app-order-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss'],
})
export class OrderDialogComponent implements OnInit {
  restaurantId!: string;
  orderId!: string;
  tableId!: string;
  number!: number;
  isNew!: boolean;

  order$!: Observable<Order | null>;
  itemsArray: OrderItem[] = [];
  private _items$ = new BehaviorSubject<OrderItem[]>([]);
  items$ = this._items$.asObservable();
  total: number = 0;

  constructor(
    private ordersService: OrdersService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<OrderDialogComponent>,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.restaurantId = this.data.restaurantId;
    this.orderId = this.data.orderId;
    this.tableId = this.data.tableId;
    this.number = this.data.number;
    this.isNew = this.data.isNew;

    if (this.orderId) {
      this.order$ = this.ordersService.getOrder(this.restaurantId, this.orderId);
      this.ordersService.getOrderItems(this.restaurantId, this.orderId)
        .pipe(map(items => items.map(item => ({ ...item, subtotal: item.price * item.quantity }))))
        .subscribe(arr => {
          this.itemsArray = arr;
          this._items$.next(arr);
          this.updateTotal();
        });
    }
  }

  drop(event: CdkDragDrop<OrderItem[]>) {
    moveItemInArray(this.itemsArray, event.previousIndex, event.currentIndex);
    this._items$.next([...this.itemsArray]);
    this.updateTotal();
  }

  updateTotal() {
    this.total = this.itemsArray.reduce((acc, item) => acc + item.subtotal, 0);
  }

  addItem() {
    const dRef = this.dialog.open(MenuDialogComponent, { width: '600px', data: { restaurantId: this.restaurantId } });
    dRef.afterClosed().subscribe(async (product: Product | null) => {
      if (!product) return;

      const price = product.isOffer ? product.offerPrice ?? product.price : product.price;
      const item: OrderItem = { productId: product.productId, name: product.name, quantity: 1, price, subtotal: price, categoryId: product.categoryId, description: product.description, imageUrl: product.imageUrl };

      try { await this.ordersService.addItemWithStatusCheck(this.restaurantId, this.orderId, item); }
      catch (e: any) { this.dialogService.errorDialog('Error', e.message || 'No se pudo agregar el ítem.'); }
    });
  }

  async removeItem(item: OrderItem) {
    this.dialogService.confirmDialog({ title: 'Eliminar ítem', message: `¿Desea eliminar "${item.name}" del pedido?` })
      .subscribe(async (confirmed) => {
        if (!confirmed) return;
        try { await this.ordersService.removeItem(this.restaurantId, this.orderId, item.productId); }
        catch (e: any) { this.dialogService.errorDialog('Error', e.message || 'No se pudo eliminar el ítem.'); }
      });
  }

  async closeOrder() {
    try {
      await this.ordersService.closeOrder(this.restaurantId, this.orderId, this.tableId);
      this.dialogService.infoDialog('Pedido cerrado', 'El pedido se cerró correctamente.');
      this.dialogRef.close(true);
    } catch (e: any) {
      this.dialogService.errorDialog('Error', e.message || 'No se pudo cerrar el pedido.');
    }
  }

  async cancelOrder() {
    this.dialogService.confirmDialog({ title: 'Cancelar pedido', message: '¿Seguro que deseas cancelar este pedido?' })
      .subscribe(async (confirmed) => {
        if (!confirmed) return;
        try {
          await this.ordersService.updateOrderStatus(this.restaurantId, this.orderId, 'cancelled');
          await this.ordersService.closeOrder(this.restaurantId, this.orderId, this.tableId);
          this.dialogService.infoDialog('Pedido cancelado', 'El pedido ha sido cancelado correctamente.');
          this.dialogRef.close(true);
        } catch (e: any) {
          this.dialogService.errorDialog('Error', e.message || 'No se pudo cancelar el pedido.');
        }
      });
  }

  exit() {
    this.dialogRef.close(null);
  }
}
