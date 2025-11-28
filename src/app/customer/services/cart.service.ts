import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../products/model/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface PersistedCart {
  restaurantId: string | null;
  items: CartItem[];
}

const STORAGE_KEY = 'palex_cart_v1';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // estado reactivo del carrito
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartItemsSubject.asObservable();

  // restaurante al que pertenecen los items guardados actualmente
  private currentRestaurantId: string | null = null;

  constructor() {
    // al iniciar cargamos lo que haya en localStorage (si existe)
    this.restoreFromStorage();
  }

  /** ---------- Persistencia local ---------- */
  private saveToStorage() {
    const payload: PersistedCart = {
      restaurantId: this.currentRestaurantId,
      items: this.getCartItems(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('No se pudo guardar carrito en localStorage', e);
    }
  }

  private restoreFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedCart;
      this.currentRestaurantId = parsed.restaurantId ?? null;
      this.cartItemsSubject.next(parsed.items ?? []);
    } catch (e) {
      console.warn('No se pudo restaurar carrito', e);
      this.currentRestaurantId = null;
      this.cartItemsSubject.next([]);
    }
  }

  /** ---------- Helpers ---------- */
  getCartItems(): CartItem[] {
    return this.cartItemsSubject.getValue();
  }

  getCurrentRestaurantId(): string | null {
    return this.currentRestaurantId;
  }

  /** Vacía y resetea todo */
  clearCart() {
    this.currentRestaurantId = null;
    this.cartItemsSubject.next([]);
    this.saveToStorage();
  }

  /** Carga el carrito para el restaurantId dado.
   * Si el storage tiene otro restaurant distinto, lo ignora/borra.
   */
  loadCart(restaurantId: string | null) {
    // si no recibimos restaurantId, intentamos restaurar lo persistido (ya hecho en constructor)
    if (!restaurantId) {
      this.restoreFromStorage();
      return;
    }

    // si el carrito es de otro restaurant, lo limpiamos (querés otra política: preguntar al usuario)
    if (this.currentRestaurantId && this.currentRestaurantId !== restaurantId) {
      this.clearCart();
    }

    // Si no hay restaurante actual, intentamos cargar lo persistido
    if (!this.currentRestaurantId) {
      this.restoreFromStorage();
      if (!this.currentRestaurantId) {
        // inicializamos con el restaurantId pasado
        this.currentRestaurantId = restaurantId;
      }
    }

    // si el persisted restaurant difiere, ajustamos
    if (this.currentRestaurantId !== restaurantId) {
      this.currentRestaurantId = restaurantId;
      this.clearCart();
    }
  }

  /** Añadir producto; si carrito vacío setea restaurantId; si distinto, limpia y setea. */
  addProduct(product: Product, restaurantId: string) {
    // valida restaurant
    if (!this.currentRestaurantId) this.currentRestaurantId = restaurantId;

    if (this.currentRestaurantId !== restaurantId) {
      // política: limpiar y reemplazar por el nuevo restaurante
      this.clearCart();
      this.currentRestaurantId = restaurantId;
    }

    const items = this.getCartItems();
    const existing = items.find((ci) => ci.product.productId === product.productId);

    // precio congelado: si es oferta usar offerPrice
    const finalPrice = product.isOffer && product.offerPrice != null ? product.offerPrice : product.price;
    if (existing) {
      existing.quantity++;
    } else {
      items.push({ product: { ...product, price: finalPrice }, quantity: 1 });
    }

    this.cartItemsSubject.next([...items]);
    this.saveToStorage();
  }

  /** Aumenta cantidad (usa referencia a item) */
  increase(item: CartItem, restaurantId?: string) {
    // opcionalmente comprobamos restaurantId
    if (restaurantId && this.currentRestaurantId !== restaurantId) return;
    item.quantity++;
    this.cartItemsSubject.next([...this.getCartItems()]);
    this.saveToStorage();
  }

  /** Disminuye cantidad o elimina si llega a 0 */
  decrease(item: CartItem, restaurantId?: string) {
    if (restaurantId && this.currentRestaurantId !== restaurantId) return;
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeItem(item, restaurantId);
      return;
    }
    this.cartItemsSubject.next([...this.getCartItems()]);
    this.saveToStorage();
  }

  /** Eliminar item */
  removeItem(item: CartItem, restaurantId?: string) {
    if (restaurantId && this.currentRestaurantId !== restaurantId) return;
    const items = this.getCartItems().filter((ci) => ci !== item);
    this.cartItemsSubject.next([...items]);
    // si quedó vacío, resetear restaurantId
    if (items.length === 0) this.currentRestaurantId = null;
    this.saveToStorage();
  }

  /** Total de cantidad */
  getTotalQuantity(): number {
    return this.getCartItems().reduce((sum, ci) => sum + ci.quantity, 0);
  }

  /** Total precio */
  getTotalPrice(): number {
    return this.getCartItems().reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);
  }

  /** Compat: getTotal(restaurantId) (tu componente lo llamaba así) */
  getTotal(restaurantId?: string): number {
    // si se pasa restaurantId y es distinto, devolver 0
    if (restaurantId && this.currentRestaurantId && restaurantId !== this.currentRestaurantId) return 0;
    return this.getTotalPrice();
  }
}
