import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  query,
  where,
  runTransaction,
  DocumentData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { OrderStatus, OrderItem, Order } from '../../models/order.model';

/* =====================================================
   🔹 Interfaces Firestore (TIPADO FUERTE)
===================================================== */

interface TableDoc {
  number: number;
  status: 'available' | 'seated' | 'occupied' | 'reserved';
  currentOrderId?: string | null;
}

/* =====================================================
   🔹 SERVICE
===================================================== */

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private firestore: Firestore) {}

  /* =====================================================
     PATHS
  ===================================================== */

  private ordersCol(restaurantId: string) {
    return collection(this.firestore, `restaurants/${restaurantId}/orders`);
  }

  private orderDoc(restaurantId: string, orderId: string) {
    return doc(this.firestore, `restaurants/${restaurantId}/orders/${orderId}`);
  }

  private itemsCol(restaurantId: string, orderId: string) {
    return collection(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}/items`
    );
  }

  private historyCol(restaurantId: string, orderId: string) {
    return collection(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}/history`
    );
  }

  /* =====================================================
     HISTORIAL
  ===================================================== */

  private async addStatusHistory(
    restaurantId: string,
    orderId: string,
    status: OrderStatus,
    userId: string | null
  ) {
    await addDoc(this.historyCol(restaurantId, orderId), {
      status,
      userId,
      timestamp: serverTimestamp(),
    });
  }

  /* =====================================================
     CREATE ORDER (BORRADOR / USER)
  ===================================================== */

  async createOrder(
    restaurantId: string,
    data: {
      tableId: string;
      tableNumber?: number;
      waiter?: string | null;
      createdBy: string;
      notes?: string;
    }
  ): Promise<string> {
    const ref = await addDoc(this.ordersCol(restaurantId), {
      restaurantId,
      tableId: data.tableId,
      tableNumber: data.tableNumber ?? null,
      waiter: data.waiter ?? null,
      createdBy: data.createdBy,
      notes: data.notes ?? '',
      status: 'pending' as OrderStatus,
      total: 0,
      itemsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await this.addStatusHistory(
      restaurantId,
      ref.id,
      'pending',
      data.createdBy
    );

    return ref.id;
  }

  /* =====================================================
     CREATE ORDER FOR MOZO (MULTI MESA)
  ===================================================== */

  async createOrderForMozo(
    restaurantId: string,
    data: {
      tableIds: string[];
      waiter?: string | null;
      createdBy: string;
      notes?: string;
      items: OrderItem[];
    }
  ): Promise<string> {
    const db = this.firestore;
    const tablesCol = collection(db, `restaurants/${restaurantId}/tables`);
    const ordersCol = this.ordersCol(restaurantId);

    const total = data.items.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    return await runTransaction(db, async (tx) => {
      /* 1️⃣ LEER TODAS LAS MESAS */
      const tableSnaps = await Promise.all(
        data.tableIds.map((id) => tx.get(doc(tablesCol, id)))
      );

      tableSnaps.forEach((snap) => {
        if (!snap.exists()) throw new Error('Mesa no existe');

        const table = snap.data() as TableDoc;

        if (table.currentOrderId) {
          throw new Error(`Mesa ${table.number} ocupada`);
        }
      });

      /* 2️⃣ CREAR PEDIDO PRINCIPAL */
      const orderRef = doc(ordersCol);

      tx.set(orderRef, {
        restaurantId,
        tableIds: data.tableIds,
        waiter: data.waiter ?? null,
        createdBy: data.createdBy,
        notes: data.notes ?? '',
        itemsCount: data.items.length,
        total,
        status: 'approved' as OrderStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      /* 2️⃣.1️⃣ CREAR ITEMS EN SUBCOLECCIÓN */
      data.items.forEach((item, index) => {
        const itemRef = doc(
          collection(
            this.firestore,
            `restaurants/${restaurantId}/orders/${orderRef.id}/items`
          ),
          item.productId // o doc() para id automático si preferís
        );
        tx.set(itemRef, {
          productId: item.productId,
          name: item.name,
          price: item.price,
          qty: item.qty,
          position: index,
          subtotal: item.price * item.qty,
          notes: item.notes ?? '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      /* 3️⃣ OCUPAR MESAS */
      tableSnaps.forEach((snap) => {
        tx.update(snap.ref, {
          currentOrderId: orderRef.id,
          status: 'occupied',
          updatedAt: serverTimestamp(),
        });
      });

      /* 4️⃣ HISTORIAL */
      const historyRef = doc(
        collection(
          this.firestore,
          `restaurants/${restaurantId}/orders/${orderRef.id}/history`
        )
      );

      tx.set(historyRef, {
        status: 'approved',
        userId: data.createdBy,
        timestamp: serverTimestamp(),
      });

      return orderRef.id;
    });
  }

  /* =====================================================
     UPDATE ORDER STATUS
  ===================================================== */

  async updateOrderStatus(
    restaurantId: string,
    orderId: string,
    status: OrderStatus,
    userId: string | null
  ) {
    const data: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === 'closed') data.closedAt = serverTimestamp();
    if (status === 'cancelled') data.cancelledAt = serverTimestamp();

    await updateDoc(this.orderDoc(restaurantId, orderId), data);
    await this.addStatusHistory(restaurantId, orderId, status, userId);
  }

  /* =====================================================
     GET ORDER + ITEMS
  ===================================================== */

  async getOrderWithItems(restaurantId: string, orderId: string) {
    const orderSnap = await getDoc(this.orderDoc(restaurantId, orderId));
    if (!orderSnap.exists()) throw new Error('Pedido no existe');

    const order = orderSnap.data() as Order;

    const itemsSnap = await getDocs(this.itemsCol(restaurantId, orderId));
    const items = itemsSnap.docs
      .map((d) => ({ itemId: d.id, ...d.data() }))
      .sort((a: any, b: any) => a.position - b.position);

    return { ...order, items };
  }

  /* =====================================================
     OBSERVABLES
  ===================================================== */

  getOrder(restaurantId: string, orderId: string) {
    return docData(this.orderDoc(restaurantId, orderId), {
      idField: 'orderId',
    }) as Observable<Order | null>;
  }

  getOrderItems(restaurantId: string, orderId: string) {
    return collectionData(this.itemsCol(restaurantId, orderId), {
      idField: 'itemId',
    }) as Observable<OrderItem[]>;
  }

  async updateOrder(
    restaurantId: string,
    orderId: string,
    items: OrderItem[],
    notes: string,
    userId: string
  ) {
    // 1️⃣ Validar estado actual
    const orderSnap = await getDoc(this.orderDoc(restaurantId, orderId));
    if (!orderSnap.exists()) throw new Error('Pedido no existe');

    const currentStatus = orderSnap.data()?.['status'] as OrderStatus;

    if (
      currentStatus !== 'approved' &&
      currentStatus !== 'preparing' &&
      currentStatus !== 'updated'
    ) {
      throw new Error(
        `El pedido en estado '${currentStatus}' no permite modificaciones.`
      );
    }

    // 2️⃣ Actualizar pedido (estado updated)
    await updateDoc(this.orderDoc(restaurantId, orderId), {
      notes,
      status: 'updated',
      updatedAt: serverTimestamp(),
    });

    // 3️⃣ Reemplazar ítems
    await this.replaceOrderItems(restaurantId, orderId, items);

    // 4️⃣ Recalcular total
    await this.updateOrderTotal(restaurantId, orderId);

    // 5️⃣ Historial
    await this.addStatusHistory(restaurantId, orderId, 'updated', userId);
  }

  async replaceOrderItems(
    restaurantId: string,
    orderId: string,
    items: OrderItem[]
  ) {
    const itemsRef = this.itemsCol(restaurantId, orderId);
    const batch = writeBatch(this.firestore);

    const existing = await getDocs(itemsRef);
    existing.forEach((d) => batch.delete(d.ref));

    items.forEach((item, index) => {
      const ref = doc(itemsRef);
      batch.set(ref, {
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        position: index,
        subtotal: item.price * item.qty,
        notes: item.notes ?? '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }

  async updateOrderTotal(restaurantId: string, orderId: string) {
    const snap = await getDocs(this.itemsCol(restaurantId, orderId));

    let total = 0;
    snap.forEach((d) => {
      const it: any = d.data();
      total += it.subtotal ?? it.price * it.qty;
    });

    await updateDoc(this.orderDoc(restaurantId, orderId), {
      total,
      itemsCount: snap.size,
      updatedAt: serverTimestamp(),
    });
  }

  //Cancelar pedido
  async cancelOrder(restaurantId: string, orderId: string, userId: string) {
    const db = this.firestore;
    const orderRef = this.orderDoc(restaurantId, orderId);

    return await runTransaction(db, async (tx) => {
      // 1️⃣ Obtener pedido
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists()) {
        throw new Error('Pedido no existe');
      }

      const order = orderSnap.data();
      const tableIds: string[] = order['tableIds'] ?? [];

      if (!tableIds.length) {
        throw new Error('Pedido sin mesas asociadas');
      }

      const currentStatus = order['status'] as OrderStatus;

      // 2️⃣ Validar estado
      if (['closed', 'cancelled'].includes(currentStatus)) {
        throw new Error(
          `El pedido en estado '${currentStatus}' no puede cancelarse`
        );
      }

      // 3️⃣ Cancelar pedido
      tx.update(orderRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
        cancelledAt: serverTimestamp(),
      });

      // 4️⃣ Liberar TODAS las mesas
      const tablesCol = collection(db, `restaurants/${restaurantId}/tables`);

      for (const tableId of tableIds) {
        const tableRef = doc(tablesCol, tableId);

        tx.update(tableRef, {
          currentOrderId: null,
          status: 'available',
          updatedAt: serverTimestamp(),
        });
      }

      // 5️⃣ Historial
      const historyRef = doc(
        collection(db, `restaurants/${restaurantId}/orders/${orderId}/history`)
      );

      tx.set(historyRef, {
        status: 'cancelled',
        userId,
        timestamp: serverTimestamp(),
      });
    });
  }

  // Cerrar pedido
  async closeOrder(
    restaurantId: string,
    orderId: string,
    userId: string | null
  ) {
    const db = this.firestore;

    await runTransaction(db, async (tx) => {
      // 1️⃣ Obtener la orden
      const orderRef = this.orderDoc(restaurantId, orderId);
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists()) throw new Error('Pedido no existe');

      const orderData = orderSnap.data() as Order;

      // 2️⃣ Actualizar estado de la orden
      tx.update(orderRef, {
        status: 'closed',
        closedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 3️⃣ Registrar historial
      const historyRef = doc(
        collection(db, `restaurants/${restaurantId}/orders/${orderId}/history`)
      );
      tx.set(historyRef, {
        status: 'closed',
        userId,
        timestamp: serverTimestamp(),
      });

      // 4️⃣ Liberar todas las mesas asociadas
      if (orderData.tableIds && orderData.tableIds.length > 0) {
        for (const tableId of orderData.tableIds) {
          const tableRef = doc(
            db,
            `restaurants/${restaurantId}/tables/${tableId}`
          );
          tx.update(tableRef, {
            status: 'available',
            currentOrderId: null,
            updatedAt: serverTimestamp(),
          });
        }
      }
    });
  }
}
