import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  query,
  where,
  getDocs,
  DocumentReference,
  CollectionReference,
  getDoc,
  docData
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Order, OrderItem, OrderStatus } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersService {

  constructor(private firestore: Firestore) {}

  // --------------------------------------------------------------------------
  // Referencia tipada a orders del restaurante
  // --------------------------------------------------------------------------
  private ordersCollectionRef(restaurantId: string): CollectionReference<Order> {
    return collection(this.firestore, `restaurants/${restaurantId}/orders`) as CollectionReference<Order>;
  }

  // --------------------------------------------------------------------------
  // 1) Crear pedido (oficial): crea el pedido y guarda el primer evento de
  // historial en la subcolección /orders/{orderId}/history
  // --------------------------------------------------------------------------
  async createOrder(
    restaurantId: string,
    tableId: string,
    tableNumber: number,
    force = false
  ): Promise<string> {

    // referencia a la colección de orders del restaurante
    const ordersCol = this.ordersCollectionRef(restaurantId);
    const orderRef = doc(ordersCol);
    const orderId = orderRef.id;

    // 1) Ejecutar transacción para crear pedido y marcar mesa ocupada
    await runTransaction(this.firestore, async (tx) => {

      const tableRef = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
      const tableSnap = await tx.get(tableRef);

      if (!tableSnap.exists()) throw new Error('La mesa no existe');
      if (tableSnap.data()['status'] !== 'available' && !force) {
        throw new Error('La mesa está ocupada');
      }

      // crear documento del pedido SIN poner aquí historial con serverTimestamp
      tx.set(orderRef, {
        orderId,
        restaurantId,
        tableId,
        tableNumber,
        status: 'new',
        items: [],
        total: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // marcar mesa ocupada y asignar currentOrderId
      tx.update(tableRef, {
        status: 'occupied',
        currentOrderId: orderId,
        updatedAt: serverTimestamp()
      });

      // transacción termina devolviendo (implícitamente) sin crash
      return orderId;
    });

    // 2) Agregar primer entry de historial EN UNA SUBCOLECCIÓN (fuera de la tx)
    await this.addHistoryEntry(restaurantId, orderId, 'new', null);

    return orderId;
  }

  // --------------------------------------------------------------------------
  // Helper: agregar entrada de historial como documento en la subcolección
  // /restaurants/{restaurantId}/orders/{orderId}/history
  // --------------------------------------------------------------------------
  async addHistoryEntry(restaurantId: string, orderId: string, status: OrderStatus, userId: string | null = null) {
    const historyCol = collection(this.firestore, `restaurants/${restaurantId}/orders/${orderId}/history`);
    await addDoc(historyCol, {
      status,
      timestamp: serverTimestamp(),
      userId: userId ?? null
    });
  }

  // --------------------------------------------------------------------------
  // Obtener pedidos activos por mesa
  // --------------------------------------------------------------------------
  getActiveOrderByTable(restaurantId: string, tableId: string): Observable<Order[]> {
    const ref = this.ordersCollectionRef(restaurantId);

    const q = query(
      ref,
      where('tableId', '==', tableId),
      where('status', 'in', ['new', 'pending', 'approved', 'preparing', 'ready'])
    );

    return collectionData(q, { idField: 'orderId' }) as Observable<Order[]>;
  }

  // --------------------------------------------------------------------------
  // Pedidos para cocina
  // --------------------------------------------------------------------------
  getKitchenOrders(restaurantId: string): Observable<Order[]> {
    const ref = this.ordersCollectionRef(restaurantId);

    const q = query(
      ref,
      where('status', 'in', ['approved', 'preparing'])
    );

    return collectionData(q, { idField: 'orderId' }) as Observable<Order[]>;
  }

  // --------------------------------------------------------------------------
  // Agregar ítem al pedido (añade doc en subcolección items y actualiza updatedAt)
  // --------------------------------------------------------------------------
  async addItem(restaurantId: string, orderId: string, item: OrderItem) {
    const itemsRef = collection(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}/items`
    );

    await addDoc(itemsRef, {
      ...item,
      createdAt: serverTimestamp(),
    });

    const orderRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}`
    );

    await updateDoc(orderRef, {
      updatedAt: serverTimestamp(),
    });
  }

  // --------------------------------------------------------------------------
  // Cambiar estado del pedido: actualiza el doc order y agrega entry en history
  // --------------------------------------------------------------------------
  async updateOrderStatus(
    restaurantId: string,
    orderId: string,
    newStatus: OrderStatus,
    userId?: string
  ) {
    const orderRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}`
    );

    // actualizar estado en el documento principal
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });

    // agregar historial en subcolección
    await this.addHistoryEntry(restaurantId, orderId, newStatus, userId ?? null);
  }

  // --------------------------------------------------------------------------
  // Cerrar pedido: transaction que actualiza order.status y libera la mesa,
  // y además agrega entry en history (fuera de tx para timestamp seguro)
  // --------------------------------------------------------------------------
  async closeOrder(restaurantId: string, orderId: string, tableId: string) {
    const orderRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/orders/${orderId}`
    );

    const tableRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/tables/${tableId}`
    );

    // transacción para actualizar estados atomically
    await runTransaction(this.firestore, async (tx) => {

      tx.update(orderRef, {
        status: 'closed',
        closedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      tx.update(tableRef, {
        currentOrderId: null,
        status: 'available',
        updatedAt: serverTimestamp(),
      });
    });

    // agregar historial fuera de la tx para timestamp correcto
    await this.addHistoryEntry(restaurantId, orderId, 'closed', null);
  }

  async createOrGetActiveOrder(
  restaurantId: string,
  tableId: string,
  tableNumber: number
): Promise<string> {

  // 1) Buscar pedidos activos
  const ordersCol = this.ordersCollectionRef(restaurantId);

const q = query(
  ordersCol,
  where('tableId', '==', tableId),
  where('status', 'in', ['pending', 'active'])
);
  const snap = await getDocs(q);

  if (!snap.empty) {
    // retornar el pedido activo existente
    return snap.docs[0].id;
  }

  // 2) Si no había pedido activo → crear uno nuevo
  return await this.createOrder(restaurantId, tableId, tableNumber);
}

async addItemWithStatusCheck(restaurantId: string, orderId: string, item: OrderItem) {

  const orderItemsRef = collection(
    this.firestore,
    `restaurants/${restaurantId}/orders/${orderId}/items`
  );

  // 1. Buscar si ya existe un item igual
  const q = query(orderItemsRef, where('productId', '==', item.productId));
  const snap = await getDocs(q);

  if (!snap.empty) {
    // Ya existe → lo actualizamos
    const docRef = snap.docs[0].ref;
    const existing = snap.docs[0].data() as OrderItem;

    const newQty = existing.quantity + item.quantity;
    const newSubtotal = existing.price * newQty;

    await updateDoc(docRef, {
      quantity: newQty,
      subtotal: newSubtotal,
      updatedAt: serverTimestamp()
    });

  } else {
    // No existe → crear uno nuevo
    await addDoc(orderItemsRef, {
      ...item,
      subtotal: item.price * item.quantity,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  // 2. Recalcular total del pedido
  await this.updateOrderTotal(restaurantId, orderId);
}

// --------------------------------------------------------------------------
// Recalcular el total del pedido sumando los subtotales de items
// --------------------------------------------------------------------------
async updateOrderTotal(restaurantId: string, orderId: string) {

  const itemsRef = collection(
    this.firestore,
    `restaurants/${restaurantId}/orders/${orderId}/items`
  );

  // 1. Traer todos los items del pedido
  const snap = await getDocs(itemsRef);

  let total = 0;

  snap.forEach((d) => {
    const it = d.data() as OrderItem;
    total += it.subtotal ?? (it.price * it.quantity);
  });

  // 2. Actualizar el total del pedido
  const orderRef = doc(
    this.firestore,
    `restaurants/${restaurantId}/orders/${orderId}`
  );

  await updateDoc(orderRef, {
    total,
    updatedAt: serverTimestamp()
  });
}

getOrder(restaurantId: string, orderId: string): Observable<Order | null> {
  const orderRef = doc(
    this.firestore,
    `restaurants/${restaurantId}/orders/${orderId}`
  );
  return docData(orderRef, { idField: 'orderId' }) as Observable<Order | null>;
}

getOrderItems(restaurantId: string, orderId: string): Observable<OrderItem[]> {
  const itemsRef = collection(
    this.firestore,
    `restaurants/${restaurantId}/orders/${orderId}/items`
  );
  const q = query(itemsRef);
  return collectionData(q, { idField: 'itemId' }) as Observable<OrderItem[]>;
}


}
