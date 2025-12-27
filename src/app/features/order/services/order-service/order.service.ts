import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  runTransaction,
  query,
  where,
} from '@angular/fire/firestore';

import { OrderStatus, OrderItem, Order } from '../../models/order.model';

/* =====================================================
   🔹 Interfaces Firestore (TIPADO FUERTE)
===================================================== */

interface TableDoc {
  number: number;
  status: 'available' | 'seated' | 'occupied' | 'reserved';
  currentOrderId?: string | null;
  currentOrderStatus?: OrderStatus | null; // ✅ AGREGAR
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
     CREATE ORDER FOR MOZO (MULTI MESA)
  ===================================================== */

  async createOrderForMozo(
    restaurantId: string,
    data: {
      tableIds: string[];

      // 🔹 MOZO (desnormalizado)
      waiterId: string;
      waiterName: string;
      waiterRole: string;

      createdBy: string;
      notes?: string;
      items: OrderItem[];
    }
  ): Promise<string> {
    const db = this.firestore;
    const tablesCol = collection(db, `restaurants/${restaurantId}/tables`);
    const ordersCol = this.ordersCol(restaurantId);

    // 🔹 Total calculado una sola vez
    const total = data.items.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    return await runTransaction(db, async (tx) => {
      /* =====================================================
       1️⃣ LEER TODAS LAS MESAS (1 lectura por mesa)
    ===================================================== */
      const tableSnaps = await Promise.all(
        data.tableIds.map((id) => tx.get(doc(tablesCol, id)))
      );

      const tableNumbers: number[] = [];

      tableSnaps.forEach((snap) => {
        if (!snap.exists()) {
          throw new Error('Mesa no existe');
        }

        const table = snap.data() as TableDoc;

        if (table.currentOrderId) {
          throw new Error(`Mesa ${table.number} ocupada`);
        }

        tableNumbers.push(table.number);
      });

      /* =====================================================
       2️⃣ CREAR PEDIDO PRINCIPAL (DESNORMALIZADO)
    ===================================================== */
      const orderRef = doc(ordersCol);

      tx.set(orderRef, {
        restaurantId,

        // 🔹 Mesas
        tableIds: data.tableIds,
        tableNumbers, // ✅ DESNORMALIZADO

        // 🔹 Mozo
        waiterId: data.waiterId,
        waiterName: data.waiterName,
        waiterRole: data.waiterRole,

        createdBy: data.createdBy,
        notes: data.notes ?? '',

        status: 'approved' as OrderStatus,
        total,
        itemsCount: data.items.length,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      /* =====================================================
       3️⃣ CREAR ITEMS (SUBCOLECCIÓN)
    ===================================================== */
      data.items.forEach((item, index) => {
        const itemRef = doc(
          collection(
            db,
            `restaurants/${restaurantId}/orders/${orderRef.id}/items`
          )
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

      /* =====================================================
   4️⃣ OCUPAR TODAS LAS MESAS
===================================================== */
      tableSnaps.forEach((snap) => {
        tx.update(snap.ref, {
          currentOrderId: orderRef.id,
          currentOrderStatus: 'approved',
          status: 'occupied',
          updatedAt: serverTimestamp(),
        });
      });

      /* =====================================================
       5️⃣ HISTORIAL
    ===================================================== */
      const historyRef = doc(
        collection(
          db,
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
    await runTransaction(this.firestore, async (tx) => {
      const orderRef = doc(
        this.firestore,
        `restaurants/${restaurantId}/orders/${orderId}`
      );

      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists()) return;

      const order = orderSnap.data() as Order;

      // 1️⃣ actualizar pedido
      tx.update(orderRef, {
        status,
        updatedAt: serverTimestamp(),
        ...(status === 'preparing' && { preparingAt: serverTimestamp() }),
        ...(status === 'ready' && { readyAt: serverTimestamp() }),
      });

      // 2️⃣ actualizar mesas 🔥🔥🔥
      for (const tableId of order.tableIds) {
        const tableRef = doc(
          this.firestore,
          `restaurants/${restaurantId}/tables/${tableId}`
        );

        tx.update(tableRef, {
          currentOrderStatus: status,
        });
      }

      // 3️⃣ historial
      const historyRef = collection(
        this.firestore,
        `restaurants/${restaurantId}/orders/${orderId}/history`
      );

      tx.set(doc(historyRef), {
        status,
        userId,
        timestamp: serverTimestamp(),
      });
    });
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
     ACTUALIZAR PEDIDOS DEL RESTAURANT
  ===================================================== */

  async updateOrder(
    restaurantId: string,
    orderId: string,
    items: OrderItem[],
    notes: string,
    userId: string
  ) {
    const orderSnap = await getDoc(this.orderDoc(restaurantId, orderId));
    if (!orderSnap.exists()) throw new Error('Pedido no existe');

    const currentStatus = orderSnap.data()?.['status'] as OrderStatus;
    if (!['approved', 'preparing', 'updated'].includes(currentStatus)) {
      throw new Error(
        `El pedido en estado '${currentStatus}' no permite modificaciones.`
      );
    }

    // Obtener datos actuales del pedido
    const currentOrder = orderSnap.data() as Order;

    // Crear pendingUpdate en lugar de reemplazar directamente
    await updateDoc(this.orderDoc(restaurantId, orderId), {
      pendingUpdate: {
        items,
        notes,
        total: items.reduce((acc, i) => acc + i.price * i.qty, 0),
        requestedAt: serverTimestamp(),
        kitchenDecision: null,
      },
      status: 'updated',
      updatedAt: serverTimestamp(),
    });

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

  /* =====================================================
     CANCELAR UN PEDIDO 
  ===================================================== */
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
          currentOrderStatus: null, // limpiar
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

  // Cerrar pedido con método de pago
  async closeOrder(
    restaurantId: string,
    orderId: string,
    userId: string | null,
    payment: { method: string; detail?: string } // <-- nuevo parámetro
  ) {
    const db = this.firestore;

    await runTransaction(db, async (tx) => {
      // 1️⃣ Obtener la orden
      const orderRef = this.orderDoc(restaurantId, orderId);
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists()) throw new Error('Pedido no existe');

      const orderData = orderSnap.data() as Order;

      // 2️⃣ Actualizar estado de la orden y registrar método de pago
      tx.update(orderRef, {
        status: 'closed',
        closedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        paymentMethod: payment.method,
        paymentDetail: payment.detail || null,
      });

      // 3️⃣ Registrar historial
      const historyRef = doc(
        collection(db, `restaurants/${restaurantId}/orders/${orderId}/history`)
      );
      tx.set(historyRef, {
        status: 'closed',
        userId,
        paymentMethod: payment.method,
        paymentDetail: payment.detail || null,
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
            currentOrderId: null,
            currentOrderStatus: null, // limpiar
            status: 'available',
            updatedAt: serverTimestamp(),
          });
        }
      }
    });
  }

  // 🔹 Obtener pedidos activos (no cerrados ni cancelados) de un restaurante
  async getActiveOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    const ordersColRef = collection(
      this.firestore,
      `restaurants/${restaurantId}/orders`
    );

    const q = query(
      ordersColRef,
      where('status', 'in', [
        'pending',
        'approved',
        'preparing',
        'updated',
        'ready',
        'delivered',
      ])
    );

    const snapshot = await getDocs(q);
    const orders: Order[] = snapshot.docs.map(
      (doc) =>
        ({
          orderId: doc.id,
          ...doc.data(),
        } as Order)
    );

    return orders;
  }
}
