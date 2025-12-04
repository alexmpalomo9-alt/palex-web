import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  setDoc,
  updateDoc,
  collection,
  collectionData,
  query,
  where,
  getDoc
} from '@angular/fire/firestore';

import { nanoid } from 'nanoid';
import { Order, OrderItem, OrderStatusChange } from '../models/order.model';
import { Table } from '../../restaurant/restaurant-tables/model/tables.model';

@Injectable({ providedIn: 'root' })
export class OrdersService {

  private firestore = inject(Firestore);

  /** ===============================
   *   CREATE ORDER
   *  =============================== */
  async createOrder(
    restaurantId: string,
    table: Table,
    items: OrderItem[],
    notes?: string
  ): Promise<string> {

    const orderId = nanoid();
    const now = new Date().toISOString();

    const total = items.reduce((acc, item) => acc + item.subtotal, 0);

    const order: Order = {
      orderId,
      restaurantId,
      tableId: table.tableId,
      tableNumber: table.number,
      items,
      total,
      notes,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      history: [
        { status: 'pending', timestamp: now }
      ]
    };

    const orderRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}`
    );

    const tableRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/tables/${table.tableId}`
    );

    // escribir pedido
    await setDoc(orderRef, order);

    // actualizar mesa
    await updateDoc(tableRef, {
      currentOrderId: orderId,
      status: 'occupied',
      updatedAt: now
    });

    return orderId;
  }

  /** ===============================
   *   GET ORDER (STREAM)
   *  =============================== */
  getOrder(restaurantId: string, orderId: string) {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}`
    );
    return docData(ref, { idField: 'orderId' });
  }

  /** ===============================
   *   GET ORDER SNAPSHOT ONCE
   *  =============================== */
  async getOrderSnapshot(
    restaurantId: string,
    orderId: string
  ): Promise<Order | null> {

    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}`
    );

    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Order) : null;
  }

  /** ===============================
   *   UPDATE STATUS + HISTORY
   *  =============================== */
  async updateStatus(
    restaurantId: string,
    orderId: string,
    status: Order['status'],
    userId?: string
  ) {
    const now = new Date().toISOString();

    const order = await this.getOrderSnapshot(restaurantId, orderId);
    if (!order) throw new Error('El pedido no existe');

    const history: OrderStatusChange[] = [
      ...order.history,
      { status, timestamp: now, userId }
    ];

    const orderRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}`
    );

    await updateDoc(orderRef, {
      status,
      updatedAt: now,
      history
    });
  }

  /** ===============================
   *   ADD ITEM TO ORDER
   *  =============================== */
  async addItem(
    restaurantId: string,
    orderId: string,
    item: OrderItem
  ) {
    const now = new Date().toISOString();
    const order = await this.getOrderSnapshot(restaurantId, orderId);
    if (!order) throw new Error('Order not found');

    const items = [...order.items, item];
    const total = items.reduce((acc, i) => acc + i.subtotal, 0);

    const orderRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}`
    );

    await updateDoc(orderRef, {
      items,
      total,
      updatedAt: now
    });
  }

  /** ===============================
   *   REMOVE ITEM
   *  =============================== */
  // async removeItem(
  //   restaurantId: string,
  //   orderId: string,
  //   itemId: string
  // ) {
  //   const now = new Date().toISOString();
  //   const order = await this.getOrderSnapshot(restaurantId, orderId);
  //   if (!order) throw new Error('Order not found');

  //   const items = order.items.filter(i => i.itemId !== itemId);
  //   const total = items.reduce((acc, i) => acc + i.subtotal, 0);

  //   const orderRef = doc(
  //     this.firestore,
  //     `restaurants/${restaurantId}/orders/${orderId}`
  //   );

  //   await updateDoc(orderRef, {
  //     items,
  //     total,
  //     updatedAt: now
  //   });
  // }

  /** ===============================
   *   MOVE ORDER TO ANOTHER TABLE
   *  =============================== */
  async moveOrder(
    restaurantId: string,
    orderId: string,
    fromTable: Table,
    toTable: Table
  ) {
    const now = new Date().toISOString();

    const orderRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}`
    );

    const fromTableRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/tables/${fromTable.tableId}`
    );

    const toTableRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/tables/${toTable.tableId}`
    );

    // actualizar pedido
    await updateDoc(orderRef, {
      tableId: toTable.tableId,
      tableNumber: toTable.number,
      updatedAt: now
    });

    // liberar mesa origen
    await updateDoc(fromTableRef, {
      currentOrderId: null,
      status: 'available',
      updatedAt: now
    });

    // asignar mesa destino
    await updateDoc(toTableRef, {
      currentOrderId: orderId,
      status: 'occupied',
      updatedAt: now
    });
  }

  /** ===============================
   *   GET ORDERS BY STATUS
   *  =============================== */
  getOrdersByStatus(restaurantId: string, status: Order['status']) {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/orders`
    );
    const q = query(ref, where('status', '==', status));
    return collectionData(q, { idField: 'orderId' });
  }

  /** ===============================
   *   CLOSE ORDER
   *  =============================== */
  async closeOrder(
    restaurantId: string,
    orderId: string,
    table: Table
  ) {
    const now = new Date().toISOString();

    const orderRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}`
    );

    const tableRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/tables/${table.tableId}`
    );

    await updateDoc(orderRef, {
      status: 'delivered',
      closedAt: now,
      updatedAt: now
    });

    await updateDoc(tableRef, {
      currentOrderId: null,
      status: 'available',
      updatedAt: now
    });
  }
}
