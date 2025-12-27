import { Injectable } from '@angular/core';
import { Firestore, collection, doc, runTransaction, serverTimestamp } from '@angular/fire/firestore';
import { OrderItem, Order, OrderStatus } from '../../models/order.model';
import { TableStatus } from '../../../restaurant/restaurant-tables/model/tables.model';

interface TableDoc {
  number: number;
  status: TableStatus;
  currentOrderId?: string | null;
  currentOrderStatus?: OrderStatus; // Aquí gestionamos el estado del pedido en la mesa
}

@Injectable({
  providedIn: 'root',
})
export class CustomerOrderService {
  constructor(private firestore: Firestore) {}

  // Obtener la colección de pedidos
  private ordersCol(restaurantId: string) {
    return collection(this.firestore, `restaurants/${restaurantId}/orders`);
  }

  // Obtener la colección de mesas
  private tablesCol(restaurantId: string) {
    return collection(this.firestore, `restaurants/${restaurantId}/tables`);
  }

  // Historial de los pedidos
  private historyCol(restaurantId: string, orderId: string) {
    return collection(this.firestore, `restaurants/${restaurantId}/orders/${orderId}/history`);
  }

  async createOrderForClient(
    restaurantId: string,
    data: {
      tableIds: string[]; // Mesas seleccionadas
      guestId: string; // Identificador del invitado
      guestName: string; // Nombre del invitado
      createdBy: string; // Quién crea el pedido (cliente o invitado)
      notes?: string; // Notas opcionales para el pedido
      items: OrderItem[]; // Artículos del pedido
    }
  ): Promise<string> {
    const db = this.firestore;
    const tablesCol = this.tablesCol(restaurantId);
    const ordersCol = this.ordersCol(restaurantId);

    // Calcular el total del pedido
    const total = data.items.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    // Ejecutar la transacción
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
          throw new Error(`Mesa no existe`);
        }

        const table = snap.data() as TableDoc;

        // Verificar que la mesa esté libre (status 'available' o 'seated')
        if (table.status !== 'available' && table.status !== 'seated') {
          throw new Error(`Mesa ${table.number} ya está ocupada o reservada`);
        }

        if (table.currentOrderId) {
          throw new Error(`Mesa ${table.number} ya tiene un pedido activo`);
        }

        tableNumbers.push(table.number);
      });

      /* ===================================================== 
       2️⃣ CREAR EL PEDIDO PRINCIPAL
      ===================================================== */
      const orderRef = doc(ordersCol);

      const orderData: Order = {
        restaurantId,
        tableIds: data.tableIds,
        tableNumbers,
        guestId: data.guestId,
        guestName: data.guestName,
        createdBy: data.createdBy,
        notes: data.notes ?? '',
        status: 'pending', // El pedido comienza como 'pending' (esperando aprobación)
        total,
        itemsCount: data.items.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        orderId: '',
      };

      tx.set(orderRef, orderData);

      /* ===================================================== 
       3️⃣ CREAR LOS ITEMS (SUBCOLECCIÓN)
      ===================================================== */
      data.items.forEach((item, index) => {
        const itemRef = doc(collection(db, `restaurants/${restaurantId}/orders/${orderRef.id}/items`));

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
       4️⃣ ACTUALIZAR EL ESTADO DE LAS MESAS
      ===================================================== */
      tableSnaps.forEach((snap) => {
        tx.update(snap.ref, {
          currentOrderId: orderRef.id,  // Asignar el ID del pedido a la mesa
          currentOrderStatus: 'pending', // El estado del pedido en la mesa será 'pending'
          status: 'occupied', // Cambiar el estado de la mesa a 'ocupada'
          updatedAt: serverTimestamp(),
        });
      });

      /* ===================================================== 
       5️⃣ HISTORIAL DEL PEDIDO
      ===================================================== */
      const historyRef = doc(collection(db, `restaurants/${restaurantId}/orders/${orderRef.id}/history`));

      tx.set(historyRef, {
        status: 'pending', // El historial comienza como 'pending'
        userId: data.createdBy,
        timestamp: serverTimestamp(),
      });

      return orderRef.id;  // Retornar el ID del pedido
    });
  }
}
