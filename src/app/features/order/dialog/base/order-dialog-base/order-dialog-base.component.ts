import { HostListener, OnInit, Inject, Directive } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../../auth/services/auth.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { OrderStatusService } from '../../../../../shared/services/order-status/order-status.service';
import { TableService } from '../../../../restaurant/restaurant-tables/services/table.service';
import { OrderStatus, OrderItem } from '../../../models/order.model';
import { OrdersService } from '../../../services/order.service';


@Directive() // Usamos @Directive para que pueda ser extendido
export abstract class OrderDialogBaseComponent implements OnInit {
  orderId: string | null = null;
  createdOrderId: string | null = null;
  status: OrderStatus = 'draft';
  isEditMode = false;

  items: OrderItem[] = [];
  dataSource = new MatTableDataSource<OrderItem>();
  notes = '';
  loading = false;

  restaurantId = '';
  tableId = '';
  tableNumber = 0;

  displayedColumns = ['name', 'qty', 'price', 'subtotal', 'actions'];
  isMobile = window.innerWidth <= 768;

  protected originalItems: OrderItem[] = [];
  protected originalNotes = '';

  constructor(
    protected dialog: MatDialog,
    protected dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    protected ordersService: OrdersService,
    protected dialogService: DialogService,
    protected tableService: TableService,
    protected auth: AuthService,
    protected orderStatusService: OrderStatusService
  ) {
    this.restaurantId = data.restaurantId;
    this.tableId = data.tableId;
    this.tableNumber = data.number || data.tableNumber;
    this.orderId = data.orderId ?? null;
  }

  ngOnInit(): void {
    if (this.orderId) {
      this.loadOrder();
    } else {
      this.isEditMode = false;
      this.status = 'draft';
    }
  }

  get orderStatusLabel(): string {
    return this.orderStatusService.getOrderStatusLabel(this.status);
  }

  protected async loadOrder() {
    try {
      this.loading = true;
      const order = await this.ordersService.getOrderWithItems(this.restaurantId, this.orderId!);

      this.items = (order.items || []).map((i: any) => ({
        itemId: i.itemId,
        productId: i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        subtotal: i.subtotal ?? i.price * i.qty,
        position: i.position,
        notes: i.notes ?? '',
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));

      this.originalItems = this.items.map(i => ({ ...i }));
      this.originalNotes = order.notes || '';

      this.dataSource.data = [...this.items];
      this.notes = order.notes || '';
      this.status = order.status;
      this.isEditMode = this.status !== 'draft';
    } catch (e: any) {
      this.dialogService.errorDialog('Error', e.message);
      this.dialogRef.close();
    } finally {
      this.loading = false;
    }
  }

  protected hasChanges(): boolean {
    if (this.notes !== this.originalNotes) return true;
    if (this.items.length !== this.originalItems.length) return true;

    for (let i = 0; i < this.items.length; i++) {
      const current = this.items[i];
      const original = this.originalItems[i];
      if (
        current.productId !== original.productId ||
        current.qty !== original.qty ||
        current.price !== original.price ||
        current.notes !== original.notes
      ) return true;
    }

    return false;
  }

  removeItem(index: number) {
    this.dialogService.confirmDialog({
      title: 'Eliminar item?',
      message: '¿Estás seguro de querer quitar el item del pedido?',
      type: 'question',
    }).subscribe(confirmed => {
      if (confirmed) {
        this.items.splice(index, 1);
        this.dataSource.data = [...this.items];
      }
    });
  }

  getTotal(): number {
    return this.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  }

  cancel() {
    this.dialogRef.close({ created: false });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth <= 768;
  }
}
