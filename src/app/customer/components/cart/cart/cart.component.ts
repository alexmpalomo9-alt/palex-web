import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CartService } from '../../../services/cart.service';
import { CartItemComponent } from '../cart-item/cart-item.component';
import { CartItem } from '../model/cart.model';
import { ThemeService } from '../../../../core/services/theme/theme.service';

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
  isDarkMode = false; // ✅ variable para dark mode

  constructor(
    private cartService: CartService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Suscribirse al carrito directamente
    this.cartService.cart$.subscribe((cart) => {
      if (!cart || cart.items.length === 0) {
        this.cartItems = [];
        this.total = 0;
        return;
      }

      this.cartItems = cart.items;
      this.total = this.cartService.getTotal(cart.restaurantId);
    });
    // Suscribirse al dark mode
    this.themeService.darkModeObservable.subscribe(
      (value) => (this.isDarkMode = value)
    );
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
