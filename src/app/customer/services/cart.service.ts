import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Product } from '../../products/model/product.model';
import { Cart, CartItem } from '../components/cart/model/cart.model';

const STORAGE_KEY = 'palex_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  totalQuantity$ = this.cart$.pipe(
    map(cart => cart ? cart.items.reduce((sum, i) => sum + i.quantity, 0) : 0)
  );

  constructor() { 
    this.restoreFromStorage();

    // Permite sincronizar varias pestañas
    window.addEventListener('storage', (ev: StorageEvent) => {
      if (ev.key === STORAGE_KEY) this.restoreFromStorage();
    });
  }

  private restoreFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return this.cartSubject.next(null);

    try {
      this.cartSubject.next(JSON.parse(raw));
    } catch {
      this.cartSubject.next(null);
    }
  }

  private saveToStorage(cart: Cart | null) {
    if (!cart) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  // ==================================
  // GETTERS
  // ==================================
  getCartSnapshot(): Cart | null {
    return this.cartSubject.getValue();
  }

  loadCart(): Cart | null {
    return this.getCartSnapshot();
  }

  getTotal(restaurantId: string): number {
    const cart = this.getCartSnapshot();
    if (!cart || cart.restaurantId !== restaurantId) return 0;

    return cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  // ==================================
  // HELPERS
  // ==================================
  private updateCart(cart: Cart | null) {
    this.cartSubject.next(cart);
    this.saveToStorage(cart);
  }

  clearCart() {
    this.updateCart(null);
  }

  // ==================================
  // OPERACIONES
  // ==================================
addProduct(product: Product, restaurantId: string) {

  // ✔️ Si el producto tiene oferta, usarla.
  const finalPrice = product.offerPrice && product.offerPrice > 0
    ? product.offerPrice
    : product.price;

  this.addProductToCart(
    {
      productId: product.productId!,
      name: product.name,
      price: finalPrice,      // ✔️ AQUÍ VA LA MAGIA
      imageUrl: product.imageUrl ?? null,
      categoryId: product.categoryId
    },
    restaurantId
  );
}



  addProductToCart(
    product: { productId: string; name: string; price: number; imageUrl: string | null; categoryId?: string },
    restaurantId: string
  ) {
    const current = this.getCartSnapshot();

    // Nuevo carrito si no existe o si pertenece a otro restaurante
    if (!current || current.restaurantId !== restaurantId) {
      const newCart: Cart = {
        restaurantId,
        items: [
          {
            ...product,
            quantity: 1
          }
        ],
      };
      this.updateCart(newCart);
      return;
    }

    // Editar carrito existente
    const items = [...current.items];
    const idx = items.findIndex(i => i.productId === product.productId);

    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + 1 };
    } else {
      items.push({
        ...product,
        quantity: 1
      });
    }

    this.updateCart({ ...current, items });
  }

  increase(item: CartItem, restaurantId: string) {
    const current = this.getCartSnapshot();
    if (!current || current.restaurantId !== restaurantId) return;

    const updated = current.items.map(i =>
      i.productId === item.productId
        ? { ...i, quantity: i.quantity + 1 }
        : i
    );

    this.updateCart({ ...current, items: updated });
  }

  decrease(item: CartItem, restaurantId: string) {
    const current = this.getCartSnapshot();
    if (!current || current.restaurantId !== restaurantId) return;

    const updated = current.items
      .map(i =>
        i.productId === item.productId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      )
      .filter(i => i.quantity > 0);

    this.updateCart({ ...current, items: updated });
  }

  removeItem(item: CartItem, restaurantId: string) {
    const current = this.getCartSnapshot();
    if (!current || current.restaurantId !== restaurantId) return;

    const updated = current.items.filter(i => i.productId !== item.productId);

    this.updateCart({ ...current, items: updated });
  }

  getCurrentRestaurantId(): string | null {
  return this.getCartSnapshot()?.restaurantId ?? null;
}

}
