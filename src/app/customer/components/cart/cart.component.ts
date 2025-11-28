import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem, CartService } from '../../services/cart.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent {
  restaurantId!: string;
  cartItems: CartItem[] = [];
  total = 0;

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.restaurantId = this.route.snapshot.paramMap.get('id')!;

    this.cartService.loadCart(this.restaurantId);

    this.cartService.cart$.subscribe((items) => {
      this.cartItems = items;
      this.total = this.cartService.getTotal(this.restaurantId);
    });
  }

  increase(item: CartItem) {
    this.cartService.increase(item, this.restaurantId);
  }

  decrease(item: CartItem) {
    this.cartService.decrease(item, this.restaurantId);
  }

  remove(item: CartItem) {
    this.cartService.removeItem(item, this.restaurantId);
  }
}
