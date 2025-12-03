import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Cart {
  restaurantId: string;
  items: CartItem[];
}
interface ProductCatalog {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
}


@Component({
      imports: [CommonModule],
  selector: 'app-test-cart',
  template: `
    <h2>🛒 Test Cart</h2>

    <div *ngFor="let product of products" style="margin-bottom:1rem;">
      <img [src]="product.imageUrl" width="50" alt="{{product.name}}">
      <strong>{{product.name}}</strong> - {{product.price | currency}}
      <button (click)="addToCart(product)">Agregar</button>
    </div>

    <hr>

    <h3>Carrito:</h3>
    <div *ngIf="(cart$ | async) as cart; else empty">
      <div *ngFor="let item of cart.items">
        {{item.name}} x {{item.quantity}} = {{item.price * item.quantity | currency}}
        <button (click)="increase(item.productId)">+</button>
        <button (click)="decrease(item.productId)">-</button>
        <button (click)="remove(item.productId)">Eliminar</button>
      </div>
      <p><strong>Total:</strong> {{total$ | async | currency}}</p>
      <p><strong>Cantidad total:</strong> {{cartQuantity$ | async}}</p>
    </div>
    <ng-template #empty>
      <p>El carrito está vacío.</p>
    </ng-template>
  `
})
export class TestCartComponent {
  // Productos ficticios
products = [
  { productId: 'p1', name: 'Hamburguesa', price: 15000, imageUrl: 'https://via.placeholder.com/50', quantity: 0 },
  { productId: 'p2', name: 'Gaseosa Pepsi', price: 1600, imageUrl: 'https://via.placeholder.com/50', quantity: 0 },
  { productId: 'p3', name: 'Papas fritas', price: 5000, imageUrl: 'https://via.placeholder.com/50', quantity: 0 }
];

  // CartService simulado
  private cartSubject = new BehaviorSubject<Cart>({ restaurantId: 'TEST_RESTAURANT', items: [] });
  cart$ = this.cartSubject.asObservable();

  total$ = this.cart$.pipe(
    map(cart => cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0))
  );

  cartQuantity$ = this.cart$.pipe(
    map(cart => cart.items.reduce((sum, i) => sum + i.quantity, 0))
  );

  addToCart(product: ProductCatalog) {
    const cart = this.cartSubject.value;
    const found = cart.items.find(i => i.productId === product.productId);
    if (found) {
      found.quantity += 1;
    } else {
      cart.items.push({ ...product, quantity: 1 });
    }
    this.cartSubject.next({ ...cart });
  }

  increase(productId: string) {
    const cart = this.cartSubject.value;
    const item = cart.items.find(i => i.productId === productId);
    if (item) item.quantity += 1;
    this.cartSubject.next({ ...cart });
  }

  decrease(productId: string) {
    const cart = this.cartSubject.value;
    const item = cart.items.find(i => i.productId === productId);
    if (!item) return;
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId !== productId);
    }
    this.cartSubject.next({ ...cart });
  }

  remove(productId: string) {
    const cart = this.cartSubject.value;
    cart.items = cart.items.filter(i => i.productId !== productId);
    this.cartSubject.next({ ...cart });
  }
}
