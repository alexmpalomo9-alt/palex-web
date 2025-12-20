import { Injectable } from '@angular/core';
import { Observable, switchMap, of, combineLatest, map } from 'rxjs';
import {
  Order,
  OrderItem,
  OrderStatus,
} from '../../../order/models/order.model';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class KitchenService {
  constructor(private firestore: Firestore) {}

  /* =====================================================
     OBTIENE PEDIDOS ACTIVOS
  ===================================================== */

  getActiveOrdersWithItemsRealtime(
    restaurantId: string
  ): Observable<(Order & { items: OrderItem[] })[]> {
    const ordersRef = collection(
      this.firestore,
      `restaurants/${restaurantId}/orders`
    );

    const q = query(
      ordersRef,
      where('status', 'in', ['approved', 'updated', 'preparing']),
      orderBy('createdAt', 'asc')
    );

    return collectionData(q, { idField: 'orderId' }).pipe(
      switchMap((orders) => {
        if (!orders.length) return of([]);
        return combineLatest(
          orders.map((o) =>
            this.getOrderWithItemsRealtime(restaurantId, o.orderId)
          )
        );
      })
    );
  }

  private getOrderWithItemsRealtime(
    restaurantId: string,
    orderId: string
  ): Observable<Order & { items: OrderItem[] }> {
    const orderRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}`
    );

    const itemsRef = collection(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}/items`
    );

    return combineLatest([
      docData(orderRef, { idField: 'orderId' }) as Observable<Order>,
      collectionData(itemsRef, { idField: 'itemId' }) as Observable<OrderItem[]>,
    ]).pipe(map(([order, items]) => ({ ...order, items })));
  }

  /* =====================================================
     HELPERS
  ===================================================== */

  private orderRef(restaurantId: string, orderId: string) {
    return doc(this.firestore, `restaurants/${restaurantId}/orders/${orderId}`);
  }

  private tableRef(restaurantId: string, tableId: string) {
    return doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
  }

  private historyCol(restaurantId: string, orderId: string) {
    return collection(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}/history`
    );
  }

  /* =====================================================
     🍳 EN PREPARACIÓN
  ===================================================== */

  async markPreparing(
    restaurantId: string,
    orderId: string,
    userId: string | null
  ) {
    await runTransaction(this.firestore, async (tx) => {
      const orderSnap = await tx.get(this.orderRef(restaurantId, orderId));
      if (!orderSnap.exists()) return;

      const order = orderSnap.data() as Order;

      // 1️⃣ Pedido
      tx.update(this.orderRef(restaurantId, orderId), {
        status: 'preparing' as OrderStatus,
        preparingAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2️⃣ Mesas 🔥
      for (const tableId of order.tableIds ?? []) {
        tx.update(this.tableRef(restaurantId, tableId), {
          currentOrderStatus: 'preparing',
        });
      }

      // 3️⃣ Historial
      tx.set(doc(this.historyCol(restaurantId, orderId)), {
        status: 'preparing',
        userId,
        timestamp: serverTimestamp(),
      });
    });
  }

  /* =====================================================
     ✅ LISTO
  ===================================================== */

  async markReady(
    restaurantId: string,
    orderId: string,
    userId: string | null
  ) {
    await runTransaction(this.firestore, async (tx) => {
      const orderSnap = await tx.get(this.orderRef(restaurantId, orderId));
      if (!orderSnap.exists()) return;

      const order = orderSnap.data() as Order;

      // 1️⃣ Pedido
      tx.update(this.orderRef(restaurantId, orderId), {
        status: 'ready' as OrderStatus,
        readyAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2️⃣ Mesas 🔥
      for (const tableId of order.tableIds ?? []) {
        tx.update(this.tableRef(restaurantId, tableId), {
          currentOrderStatus: 'ready',
        });
      }

      // 3️⃣ Historial
      tx.set(doc(this.historyCol(restaurantId, orderId)), {
        status: 'ready',
        userId,
        timestamp: serverTimestamp(),
      });
    });
  }
}
