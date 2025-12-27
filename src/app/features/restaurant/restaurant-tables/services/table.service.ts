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
  serverTimestamp,
  writeBatch,
  orderBy,
} from '@angular/fire/firestore';

import { from, map, Observable } from 'rxjs';
import { Table } from '../model/tables.model';

@Injectable({ providedIn: 'root' })
export class TableService {
  constructor(private firestore: Firestore) {}

  // ===========================================================================
  // 🟢 1. Obtener todas las mesas del restaurante
  // ===========================================================================
  getTablesByRestaurant(restaurantId: string): Observable<Table[]> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/tables`
    );
    const q = query(ref, orderBy('number', 'asc')); // ✅ Orden ascendente por número de mesa
    return collectionData(q, { idField: 'tableId' }) as Observable<Table[]>;
  }

  // ===========================================================================
  // 🟢 2. Obtener mesa por ID
  // ===========================================================================

  getTableById(
    restaurantId: string,
    tableId: string
  ): Observable<Table | null> {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/tables/${tableId}`
    );

    return from(getDoc(ref)).pipe(
      map((snap) => {
        if (!snap.exists()) return null;
        return {
          tableId: snap.id,
          ...(snap.data() as Omit<Table, 'tableId'>),
        };
      })
    );
  }

  // ===========================================================================
  // 🟢 3. Obtener mesa por qrSlug (cliente)
  // ===========================================================================
  async getTableBySlug(
    restaurantId: string,
    qrSlug: string
  ): Promise<Table | null> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/tables`
    );
    const q = query(ref, where('qrSlug', '==', qrSlug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { tableId: d.id, ...(d.data() as Omit<Table, 'tableId'>) };
  }

  // ===========================================================================
  // 🟢 4. Validar número de mesa duplicado
  // ===========================================================================
  async existsTableNumber(
    restaurantId: string,
    number: number
  ): Promise<boolean> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/tables`
    );
    const q = query(ref, where('number', '==', number));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  // ===========================================================================
  // 🟢 5. Crear mesa (ADMIN)
  // ===========================================================================
  async createTable(data: Partial<Table> & { restaurantId: string }) {
    const { restaurantId } = data;
    if (data.number !== undefined) {
      const exists = await this.existsTableNumber(
        restaurantId,
        Number(data.number)
      );
      if (exists)
        throw new Error(`Ya existe una mesa con el número ${data.number}`);
    }
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/tables`
    );
    const docRef = await addDoc(ref, {
      ...data,
      status: 'available',
      currentOrderId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { tableId: docRef.id };
  }

  // ===========================================================================
  // 🟢 6. Actualizar datos generales de mesa
  // ===========================================================================
  async updateTable(
    restaurantId: string,
    tableId: string,
    data: Partial<Table>
  ) {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/tables/${tableId}`
    );
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('La mesa no existe');

    const currentData = snap.data() as Table;

    // ❌ Evitar escritura si no hay cambios
    const hasChanges = Object.keys(data).some(
      (key) => (data as any)[key] !== (currentData as any)[key]
    );
    if (!hasChanges) return;

    // ⚠️ Validar número duplicado si cambió
    if (data.number !== undefined && data.number !== currentData.number) {
      const exists = await this.existsTableNumber(
        restaurantId,
        Number(data.number)
      );
      if (exists)
        throw new Error(`Ya existe una mesa con el número ${data.number}`);
    }

    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
  // ===========================================================================
  // 🟢 7. Cambiar estado manual de mesa
  // ===========================================================================
  async updateTableStatus(
    restaurantId: string,
    tableId: string,
    status: Table['status']
  ) {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/tables/${tableId}`
    );
    await updateDoc(ref, { status, updatedAt: serverTimestamp() });
  }

  // ===========================================================================
  // 🟢 8. Validar que todas las mesas estén disponibles
  // ===========================================================================
  async validateTablesAvailable(restaurantId: string, tableIds: string[]) {
    for (const tableId of tableIds) {
      const ref = doc(
        this.firestore,
        `restaurants/${restaurantId}/tables/${tableId}`
      );
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        throw new Error(`La mesa ${tableId} no existe`);
      }

      if (snap.data()['status'] !== 'available') {
        throw new Error(`La mesa ${snap.data()['number']} no está disponible`);
      }
    }
  }

  // ===========================================================================
  // 🟢 9. Asignar pedido a UNA o MUCHAS mesas (ATÓMICO)
  // ===========================================================================
  async assignOrderToTables(
    restaurantId: string,
    tableIds: string[],
    orderId: string
  ) {
    return runTransaction(this.firestore, async (tx) => {
      for (const tableId of tableIds) {
        const ref = doc(
          this.firestore,
          `restaurants/${restaurantId}/tables/${tableId}`
        );
        const snap = await tx.get(ref);

        if (!snap.exists()) throw new Error('Mesa no existe');
        if (snap.data()['status'] !== 'available') {
          throw new Error(`Mesa ${snap.data()['number']} no disponible`);
        }

        tx.update(ref, {
          currentOrderId: orderId,
          status: 'occupied',
          updatedAt: serverTimestamp(),
        });
      }
    });
  }

  // ===========================================================================
  // 🟢 10. Liberar UNA o MUCHAS mesas (cerrar / cancelar pedido)
  // ===========================================================================
  async clearTables(restaurantId: string, tableIds: string[]) {
    if (!tableIds || !tableIds.length) return;

    const batch = writeBatch(this.firestore);

    tableIds.forEach((tableId) => {
      const ref = doc(
        this.firestore,
        `restaurants/${restaurantId}/tables/${tableId}`
      );
      batch.update(ref, {
        status: 'available',
        currentOrderId: null,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }

  // ===========================================================================
  // 🟢 11. Agregar una mesa a un pedido existente
  // ===========================================================================
  async addTableToOrder(
    restaurantId: string,
    tableId: string,
    orderId: string
  ) {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/tables/${tableId}`
    );

    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error('La mesa no existe');
    }

    if (snap.data()['status'] !== 'available') {
      throw new Error('La mesa no está disponible');
    }

    await updateDoc(ref, {
      currentOrderId: orderId,
      status: 'occupied',
      updatedAt: serverTimestamp(),
    });
  }

  // ===========================================================================
  // 🟢 12. Quitar una mesa de un pedido
  // ===========================================================================
  async removeTableFromOrder(restaurantId: string, tableId: string) {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/tables/${tableId}`
    );

    await updateDoc(ref, {
      currentOrderId: null,
      status: 'available',
      updatedAt: serverTimestamp(),
    });
  }

  // ===========================================================================
  // 🟢 13. Eliminar mesa (solo si no tiene pedido activo)
  // ===========================================================================
  async deleteTable(restaurantId: string, tableId: string) {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/tables/${tableId}`
    );
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    if (snap.data()['currentOrderId'])
      throw new Error('No se puede eliminar una mesa con pedido activo');
    await deleteDoc(ref);
  }
}
