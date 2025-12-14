import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrderDialogFacade } from '../../../order/facades/order-dialog/order-dialog.service';
import { SharedModule } from '../../../../shared/shared.module';
import { OrderDialogFooterComponent } from '../../../order/components/order-dialog-footer/order-dialog-footer.component';
import { OrderTotalComponent } from '../../../order/components/order-total/order-total.component';
import { OrderNotesComponent } from '../../../order/components/order-notes/order-notes.component';
import { OrderDialogHeaderComponent } from '../../../order/components/order-dialog-header/order-dialog-header.component';
import { MatTableDataSource } from '@angular/material/table';
import { OrderItemsTableComponent } from '../../../order/components/order-items-table/order-items-table.component';

@Component({
  selector: 'app-order-dialog',
  standalone: true,
  imports: [
    SharedModule,
    OrderDialogFooterComponent,
    OrderTotalComponent,
    OrderNotesComponent,
    OrderDialogHeaderComponent,
    OrderItemsTableComponent,
  ],
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss'],
})
export class OrderDialogComponent implements OnInit {
  displayedColumns = ['name', 'qty', 'price', 'subtotal', 'actions'];
  dataSource = new MatTableDataSource<any>();

  // ---------------------------
  // 🟩 Estado
  // ---------------------------
  get state() {
    return this.facade.state();
  }

  get tableNumbers(): number[] {
    return this.facade.state().tableNumbers;
  }

  get orderStatusLabel() {
    return this.facade.getOrderStatusLabel(this.facade.state().status);
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<OrderDialogComponent>,
    public facade: OrderDialogFacade
  ) {}

  ngOnInit() {
    this.facade.initialize(this.data);
    this.dataSource.data = this.state.items;
  }

  // ---------------------------
  // 🟦 Métodos puente para hijos
  // ---------------------------
  addItemDialog() {
    this.facade.addItemDialog();
  }

  removeItem(index: number) {
    this.facade.removeItem(index);
    this.dataSource.data = this.state.items;
  }

  cancel() {
    this.close();
  }

  close() {
    this.dialogRef.close();
  }

  async createOrder() {
    const ok = await this.facade.createOrder();
    if (ok) {
      this.dialogRef.close({ success: true });
    }
  }

  async updateOrder() {
    try {
      await this.facade.updateOrder();
      this.close();
    } catch (error) {}
  }

  async cancelOrder() {
    try {
      await this.facade.cancelOrder();
      this.close();
    } catch (error) {}
  }

  async closeOrder() {
    try {
      const ok = await this.facade.closeOrder();
      if (ok) this.close(); // cierra el diálogo después de mostrar el mensaje
    } catch (error) {
      console.error(error);
    }
  }
}
