import { Component, Input, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CartService } from '../../../services/cart.service';
import { CartItemComponent } from '../cart-item/cart-item.component';
import { CartItem } from '../model/cart.model';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { CustomerOrderService } from '../../../../features/order/services/customer-order/customer-order.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmOrderDialogComponent } from '../../../../features/order/components/confirm-order-dialog/confirm-order-dialog/confirm-order-dialog.component';
import { UiFeedbackService } from '../../../../shared/services/ui-feedback/ui-feedback.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [SharedModule, CartItemComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total = 0;

  @Input() restaurantId!: string;
  @Input() tableId!: string;
  @Input() tableNumber?: number;
  @Input() tableName?: string;
  @Input() isQrFlow = false;
    private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private customerOrderService: CustomerOrderService,
    private dialog: MatDialog,
    private uiFeedback: UiFeedbackService,
    private snackBar: MatSnackBar,

  ) {}

  ngOnInit() {
    this.cartService.cart$
    .pipe(takeUntil(this.destroy$))
.subscribe((cart) => {
      if (!cart || cart.items.length === 0) {
        this.cartItems = [];
        this.total = 0;
        return;
      }

      this.cartItems = cart.items;
      this.total = this.cartService.getTotal(cart.restaurantId);
    });
  }
  ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

  clearCart() {
    this.cartService.clearCart();

    this.uiFeedback.show('🗑️ Carrito vaciado correctamente', 'info');
  }

  get actionLabel(): string {
    return this.isQrFlow ? 'Realizar pedido' : 'Pagar';
  }

  onPrimaryAction() {
    if (!this.isQrFlow) {
      this.goToPayment();
      return;
    }

    this.openConfirmDialog();
  }
  private goToPayment() {
    // más adelante
    // this.router.navigate(['restaurant', this.slug, 'checkout']);

    console.log('Ir a pagar');
  }

  openConfirmDialog() {
    const cart = this.cartService.getCartSnapshot();
    if (!cart) return;

    const dialogRef = this.dialog.open(ConfirmOrderDialogComponent, {
      disableClose: true,
      data: {
        tableId: this.tableId,
        tableNumber: this.tableNumber,
        tableName: this.tableName,
        items: cart.items,
        total: this.total,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.placeOrder();
      }
    });
  }

  private placeOrder() {
    const cart = this.cartService.getCartSnapshot();
    if (!cart || cart.items.length === 0) return;

    const orderData = {
      tableIds: [this.tableId],
      guestId: 'guest',
      guestName: 'Mesa',
      createdBy: 'qr',
      items: cart.items.map((item, index) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.quantity,
        subtotal: item.price * item.quantity,
        position: index,
        notes: '',
      })),
    };

    this.customerOrderService
      .createOrderForClient(this.restaurantId, orderData)
      .then(() => {
        this.cartService.clearCart();

        this.snackBar.open('✅ Pedido enviado correctamente', 'OK', {
          duration: 3000,
        });
      })
      .catch((error) => {
        this.snackBar.open(
          error.message || '❌ No se pudo crear el pedido',
          'Cerrar',
          { duration: 4000 }
        );
      });
  }

  increase(item: CartItem) {
    const cart = this.cartService.getCartSnapshot();
    if (!cart) return;
    this.cartService.increase(item, cart.restaurantId);
  }

  decrease(item: CartItem) {
    const cart = this.cartService.getCartSnapshot();
    if (!cart) return;
    this.cartService.decrease(item, cart.restaurantId);
  }

  remove(item: CartItem) {
    const cart = this.cartService.getCartSnapshot();
    if (!cart) return;
    this.cartService.removeItem(item, cart.restaurantId);
  }
}
