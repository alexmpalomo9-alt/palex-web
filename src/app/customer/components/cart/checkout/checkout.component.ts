import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderService } from '../../../../features/order/services/order.service';
import { CartService } from '../../../services/cart.service';
import { Cart } from '../model/cart.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {

  cart$!: Observable<Cart | null>;
  total$!: Observable<number>;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cart$ = this.cartService.cart$;
    this.total$ = this.cartService.total$;
  }

  // async confirmOrder() {
  //   const cart = this.cartService.getCartSnapshot();
  //   if (!cart || cart.items.length === 0) return;

  //   await this.orderService.createOrder(cart);

  //   this.cartService.clearCart();
  //   this.router.navigate(['/checkout/success']);
  // }
}
