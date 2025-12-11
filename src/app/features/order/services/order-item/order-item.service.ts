import { Injectable } from '@angular/core';
import { OrderItem } from '../../../order/models/order.model';
import { Product } from '../../../../products/model/product.model';

@Injectable({ providedIn: 'root' })
export class OrderItemService {
  /** Construye un OrderItem a partir de un Product */
  buildItemFromProduct(product: Product, position: number): OrderItem {
    const price = product.isOffer
      ? product.offerPrice ?? product.price
      : product.price;

    return {
      productId: product.productId,
      name: product.name,
      price,
      qty: 1,
      position,
      subtotal: price,
      notes: '',
    };
  }

  /** Agrega un item según el estado del pedido */
  addItem(items: OrderItem[], newItem: OrderItem, status: string): OrderItem[] {
    // Buscar si ya existe el item
    const index = items.findIndex(
      (item) => item.productId === newItem.productId
    );

    // Si ya existe, solo incrementar cantidad y subtotal
    if (index !== -1) {
      const updatedItems = [...items];
      const existing = updatedItems[index];

      updatedItems[index] = {
        ...existing,
        qty: existing.qty + 1,
        subtotal: (existing.qty + 1) * existing.price,
      };

      return updatedItems;
    }

    // Si no existe → agregar el nuevo
    return [...items, newItem];
  }

  /** Quita item */
  removeItem(items: OrderItem[], index: number): OrderItem[] {
    const updated = [...items];
    updated.splice(index, 1);
    return updated;
  }
  getTotal(items: OrderItem[]): number {
    return items.reduce((acc, i) => acc + i.price * i.qty, 0);
  }
  
}
