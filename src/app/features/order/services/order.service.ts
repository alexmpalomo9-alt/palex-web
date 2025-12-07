import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusChange,
} from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  constructor(private firestore: Firestore) {}

  // ================================================================
  // PATHS
  // ================================================================
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

  // ================================================================
  // HISTORIAL
  // ================================================================
  private async addStatusHistory(
    restaurantId: string,
    orderId: string,
    status: OrderStatus,
    userId: string | null
  ) {
    await addDoc(this.historyCol(restaurantId, orderId), {
      status,
      timestamp: serverTimestamp(),
      userId,
    });
  }

  // ================================================================
  // CREATE ORDER — draft USER
  // ================================================================
  async createOrder(
    restaurantId: string,
    data: {
      tableId: string;
      tableNumber?: number;
      sector?: string;
      capacity?: number;
      waiter?: string | null;
      createdBy: string;
      notes?: string;
    }
  ): Promise<string> {
    const ref = await addDoc(this.ordersCol(restaurantId), {
      restaurantId,

      // Mesa
      tableId: data.tableId,
      tableNumber: data.tableNumber ?? null,
      sector: data.sector ?? null,
      capacity: data.capacity ?? null,

      // Usuarios
      waiter: data.waiter ?? null,
      createdBy: data.createdBy,

      // Extras
      notes: data.notes || '',

      // Estado
      status: 'draft' as OrderStatus,
      total: 0,
      itemsCount: 0,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await this.addStatusHistory(restaurantId, ref.id, 'draft', data.createdBy);

    return ref.id;
  }

  // ================================================================
  // CREATE ORDER FOR MOZO — directamente aprobado
  // ================================================================
  async createOrderForMozo(
    restaurantId: string,
    data: {
      tableId: string;
      tableNumber?: number;
      waiter?: string | null;
      createdBy: string;
      notes?: string;
      items: OrderItem[];
    }
  ): Promise<string> {
    const total = data.items.reduce((acc, i) => acc + i.price * i.qty, 0);

    const ref = await addDoc(this.ordersCol(restaurantId), {
      restaurantId,
      tableId: data.tableId,
      tableNumber: data.tableNumber ?? null,
      waiter: data.waiter ?? null,
      createdBy: data.createdBy,
      notes: data.notes || '',
      itemsCount: data.items.length,
      total,
      status: 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Solo subcolección
    await this.replaceOrderItems(restaurantId, ref.id, data.items);

    await this.addStatusHistory(
      restaurantId,
      ref.id,
      'approved',
      data.createdBy
    );

    return ref.id;
  }

  // ================================================================
  // APPROVE ORDER
  // (draft | pending → approved)
  // ================================================================
  async approveOrder(restaurantId: string, orderId: string, userId: string) {
    await updateDoc(this.orderDoc(restaurantId, orderId), {
      status: 'approved',
      updatedAt: serverTimestamp(),
    });

    await this.addStatusHistory(restaurantId, orderId, 'approved', userId);
  }

  // ================================================================
  // UPDATE ORDER STATUS (general)
  // ================================================================
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

  // ================================================================
  // GET order + items (para diálogo o edición)
  // ================================================================
  async getOrderWithItems(restaurantId: string, orderId: string) {
    const orderSnap = await getDoc(this.orderDoc(restaurantId, orderId));
    if (!orderSnap.exists()) throw new Error('Pedido no existe');

    const order: Order = orderSnap.data() as any;

    const itemsSnap = await getDocs(this.itemsCol(restaurantId, orderId));
    const items = itemsSnap.docs
      .map((d) => ({ itemId: d.id, ...d.data() }))
      .sort((a: any, b: any) => a.position - b.position);

    return {
      ...order,
      items,
    };
  }

  // RULE: asegura que el pedido pueda ser actualizado
  private ensureOrderIsUpdatable(status: OrderStatus) {
    if (status === 'ready') {
      throw new Error('El pedido ya está listo, no se puede modificar.');
    }

    // Modificar esta validación para permitir 'updated'
    if (
      status !== 'approved' &&
      status !== 'preparing' &&
      status !== 'updated'
    ) {
      throw new Error(
        `El pedido en estado '${status}' no permite modificaciones.`
      );
    }
  }

  // ================================================================
  // UPDATE ORDER (modificación de ítems → estado updated)
  // ================================================================
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
    this.ensureOrderIsUpdatable(currentStatus);

    // Setea estado updated
    await updateDoc(this.orderDoc(restaurantId, orderId), {
      notes,
      status: 'updated',
      updatedAt: serverTimestamp(),
    });

    await this.replaceOrderItems(restaurantId, orderId, items);
    await this.updateOrderTotal(restaurantId, orderId);

    await this.addStatusHistory(restaurantId, orderId, 'updated', userId);
  }

  // ================================================================
  // Cocina acepta cambios (updated → preparing)
  // ================================================================
  async acceptUpdatedOrder(
    restaurantId: string,
    orderId: string,
    userId: string
  ) {
    await this.updateOrderStatus(restaurantId, orderId, 'preparing', userId);
  }

  // ================================================================
  // Cocina rechaza cambios (update_rejected)
  // ================================================================
  // ✅ Solo registra en historial, el estado operativo real no cambia
  // ================================================================
  async rejectUpdatedOrder(
    restaurantId: string,
    orderId: string,
    userId: string
  ) {
    await this.addStatusHistory(
      restaurantId,
      orderId,
      'update_rejected',
      userId
    );
  }

  // ================================================================
  // REPLACE ALL ITEMS
  // ================================================================
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

  // ================================================================
  // UPDATE TOTAL
  // ================================================================
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

  // ================================================================
// CANCEL ORDER
// (marca pedido como cancelado y no permite más modificaciones)
// ================================================================
async cancelOrder(
  restaurantId: string,
  orderId: string,
  userId: string
) {
  // 1️⃣ Obtener estado actual
  const orderSnap = await getDoc(this.orderDoc(restaurantId, orderId));
  if (!orderSnap.exists()) throw new Error('Pedido no existe');

  const currentStatus = orderSnap.data()?.['status'] as OrderStatus;

  // 2️⃣ Solo permitir cancelar si no está cerrado o ya cancelado
  if (currentStatus === 'closed' || currentStatus === 'cancelled') {
    throw new Error(`El pedido en estado '${currentStatus}' no puede cancelarse.`);
  }

  // 3️⃣ Actualizar estado a cancelado
  await updateDoc(this.orderDoc(restaurantId, orderId), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
    cancelledAt: serverTimestamp(),
  });

  // 4️⃣ Historial
  await this.addStatusHistory(restaurantId, orderId, 'cancelled', userId);
}


  // ================================================================
  // REMOVE ITEM
  // ================================================================
  async removeItem(
    restaurantId: string,
    orderId: string,
    productId: string,
    userId: string
  ) {
    const orderSnap = await getDoc(this.orderDoc(restaurantId, orderId));
    const currentStatus = orderSnap.data()?.['status'] as OrderStatus;

    this.ensureOrderIsUpdatable(currentStatus);

    const qItems = query(
      this.itemsCol(restaurantId, orderId),
      where('productId', '==', productId)
    );

    const snap = await getDocs(qItems);

    if (!snap.empty) {
      await deleteDoc(snap.docs[0].ref);
      await this.updateOrderTotal(restaurantId, orderId);

      // Al eliminar items, también pasa a updated
      await updateDoc(this.orderDoc(restaurantId, orderId), {
        status: 'updated',
        updatedAt: serverTimestamp(),
      });

      await this.addStatusHistory(restaurantId, orderId, 'updated', userId);
    }
  }

  // ================================================================
  // OBSERVABLES
  // ================================================================
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
}
