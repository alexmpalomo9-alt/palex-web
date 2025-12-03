import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CartService } from '../../../services/cart.service';
import { Cart } from '../model/cart.model';

@Component({
  selector: 'app-cart-sidebar',
  templateUrl: './cart-sidebar.component.html',
})
export class CartSidebarComponent implements OnInit {

  cart$!: Observable<Cart | null>;
  total$!: Observable<number>;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cart$ = this.cartService.cart$;
    this.total$ = this.cartService.total$;
  }

  increase(id: string) {
    this.cartService.increase(id);
  }

  decrease(id: string) {
    this.cartService.decrease(id);
  }

  remove(id: string) {
    this.cartService.remove(id);
  }
}
