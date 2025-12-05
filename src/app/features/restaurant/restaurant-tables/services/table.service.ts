import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  runTransaction,
  serverTimestamp
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Table } from '../model/tables.model';

@Injectable({ providedIn: 'root' })
export class TableService {

  constructor(private firestore: Firestore) {}

  // --------------------------------------------------------------------------
  // 🟢 1. Obtener todas las mesas del restaurante
  // --------------------------------------------------------------------------
  getTablesByRestaurant(restaurantId: string): Observable<Table[]> {
    const ref = collection(this.firestore, `restaurants/${restaurantId}/tables`);
    return collectionData(ref, { idField: 'tableId' }) as Observable<Table[]>;
  }

  // --------------------------------------------------------------------------
  // 🟢 2. Obtener una mesa por ID
  // --------------------------------------------------------------------------
  async getTableById(restaurantId: string, tableId: string): Promise<Table | null> {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return {
      tableId: snap.id,
      ...(snap.data() as Omit<Table, 'tableId'>)
    };
  }

  /** ============================
  // 🟢 3. Obtener una mesa por qrSlug
   *  ============================ */
  async getTableBySlug(restaurantId: string, qrSlug: string): Promise<Table | null> {
    const ref = collection(this.firestore, `restaurants/${restaurantId}/tables`);
    const q = query(ref, where('qrSlug', '==', qrSlug));
    const snap = await getDocs(q);

    if (snap.empty) return null;

    const docSnap = snap.docs[0];

    return {
      tableId: docSnap.id,
      ...(docSnap.data() as Omit<Table, 'tableId'>)
    };
  }


  // --------------------------------------------------------------------------
  // 🟢 4. Validar si un número de mesa ya existe
  // --------------------------------------------------------------------------
  async existsTableNumber(restaurantId: string, number: number): Promise<boolean> {
    const ref = collection(this.firestore, `restaurants/${restaurantId}/tables`);
    const q = query(ref, where('number', '==', number));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  // --------------------------------------------------------------------------
  // 🟢 5. Crear mesa (ADMIN)
  // --------------------------------------------------------------------------
  async createTable(data: Partial<Table> & { restaurantId: string }) {
    const { restaurantId } = data;

    // Verificar número duplicado
    if (data.number !== undefined) {
      const exists = await this.existsTableNumber(restaurantId, Number(data.number));
      if (exists) throw new Error(`Ya existe una mesa con el número ${data.number}`);
    }

    const ref = collection(this.firestore, `restaurants/${restaurantId}/tables`);
    const docRef = await addDoc(ref, {
      ...data,
      status: 'available',
      currentOrderId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { tableId: docRef.id };
  }

  // --------------------------------------------------------------------------
  // 🟢 6. Actualizar mesa (datos generales)
  // --------------------------------------------------------------------------
  async updateTable(restaurantId: string, tableId: string, data: Partial<Table>) {

    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);

    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  // --------------------------------------------------------------------------
  // 🟢 7. Cambiar estado de una mesa (safe)
  // --------------------------------------------------------------------------
  async updateTableStatus(
    restaurantId: string,
    tableId: string,
    status: Table['status']
  ) {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await updateDoc(ref, {
      status,
      updatedAt: serverTimestamp()
    });
  }

  // --------------------------------------------------------------------------
  // 🟢 8. Asignar un pedido a una mesa (usado por OrderService)
  // --------------------------------------------------------------------------
  async assignOrderToTable(
    restaurantId: string,
    tableId: string,
    orderId: string
  ) {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await updateDoc(ref, {
      currentOrderId: orderId,
      status: 'occupied',
      updatedAt: serverTimestamp()
    });
  }

  // --------------------------------------------------------------------------
  // 🟢 9. Limpiar mesa (cerrar pedido)
  // --------------------------------------------------------------------------
  async clearTable(restaurantId: string, tableId: string) {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await updateDoc(ref, {
      currentOrderId: null,
      status: 'available',
      updatedAt: serverTimestamp()
    });
  }

  // --------------------------------------------------------------------------
  // 🟢 10. Mover un pedido a otra mesa (mozo)
  // --------------------------------------------------------------------------
  async moveOrderToAnotherTable(
    restaurantId: string,
    fromTableId: string,
    toTableId: string
  ) {
    return runTransaction(this.firestore, async (transaction) => {
      
      const fromRef = doc(this.firestore, `restaurants/${restaurantId}/tables/${fromTableId}`);
      const toRef   = doc(this.firestore, `restaurants/${restaurantId}/tables/${toTableId}`);

      const fromSnap = await transaction.get(fromRef);
      const toSnap   = await transaction.get(toRef);

      if (!fromSnap.exists()) throw new Error('Mesa origen no existe');
      if (!toSnap.exists()) throw new Error('Mesa destino no existe');

      const currentOrderId = fromSnap.data()['currentOrderId'];
      if (!currentOrderId) throw new Error('La mesa origen no tiene un pedido activo');

      if (toSnap.data()['status'] !== 'available') {
        throw new Error('La mesa destino está ocupada');
      }

      // Liberar mesa origen
      transaction.update(fromRef, {
        currentOrderId: null,
        status: 'available',
        updatedAt: serverTimestamp()
      });

      // Asignar a mesa destino
      transaction.update(toRef, {
        currentOrderId,
        status: 'occupied',
        updatedAt: serverTimestamp()
      });
    });
  }

  // --------------------------------------------------------------------------
  // 🟢 11. Eliminar mesa
  // --------------------------------------------------------------------------
  async deleteTable(restaurantId: string, tableId: string) {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await deleteDoc(ref);
  }
}
