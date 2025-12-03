
import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, serverTimestamp } from '@angular/fire/firestore';
import { Cart } from '../../../customer/components/cart/model/cart.model';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {

  constructor(private firestore: Firestore) {}

  createOrder(cart: Cart) {
    const order: Order = {
      restaurantId: cart.restaurantId,
      items: cart.items,
      total: cart.items.reduce((s, i) => s + i.price * i.quantity, 0),
      status: 'pending',
      createdAt: serverTimestamp()
    };

    return addDoc(collection(this.firestore, 'orders'), order);
  }
}
