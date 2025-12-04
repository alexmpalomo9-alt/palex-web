import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Table, TABLES_COLLECTION } from '../model/tables.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  private firestore = inject(Firestore);

  constructor() {}

  /** ============================
   *   GET ALL TABLES (RESTAURANT)
   *  ============================ */
  getTablesByRestaurant(restaurantId: string): Observable<Table[]> {
    const ref = collection(this.firestore, `restaurants/${restaurantId}/tables`);
    return collectionData(ref, { idField: 'tableId' }) as Observable<Table[]>;
  }

  /** ============================
   *   GET TABLE BY ID
   *  ============================ */
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
   *   GET TABLE BY QR SLUG
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

  /** ============================
   *   CHECK IF TABLE NUMBER EXISTS
   *  ============================ */
  async existsTableNumber(restaurantId: string, number: number): Promise<boolean> {
    const ref = collection(this.firestore, `restaurants/${restaurantId}/tables`);
    const q = query(ref, where('number', '==', number));
    const snap = await getDocs(q);

    return !snap.empty;
  }

  /** ============================
   *   CREATE TABLE
   *  ============================ */
  async createTable(data: Partial<Table> & { restaurantId: string }) {
    const { restaurantId } = data;

    // prevent duplicate numbers
    const exists = await this.existsTableNumber(restaurantId, Number(data.number));
    if (exists) {
      throw new Error(`Ya existe una mesa con el número ${data.number}`);
    }

    const ref = collection(this.firestore, `restaurants/${restaurantId}/tables`);
    const docRef = await addDoc(ref, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return { tableId: docRef.id };
  }

  /** ============================
   *   UPDATE TABLE
   *  ============================ */
  async updateTable(restaurantId: string, tableId: string, data: Partial<Table>) {
    if (data.number !== undefined) {
      const exists = await this.existsTableNumber(restaurantId, Number(data.number));

      if (exists) {
        const refCheck = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
        const original = await getDoc(refCheck);

        if (original.data()?.['number'] !== data.number) {
          throw new Error(`Ya existe una mesa con el número ${data.number}`);
        }
      }
    }

    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await updateDoc(ref, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  /** ============================
   *   SET ENABLED / DISABLED
   *  ============================ */
  async setTableEnabled(restaurantId: string, tableId: string, enabled: boolean) {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await updateDoc(ref, {
      enabled,
      updatedAt: new Date().toISOString()
    });
  }

  /** ============================
   *   UPDATE STATUS
   *  ============================ */
  async updateStatus(
    restaurantId: string,
    tableId: string,
    status: Table['status']
  ) {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await updateDoc(ref, {
      status,
      updatedAt: new Date().toISOString()
    });
  }

  /** ============================
   *   ASSIGN ORDER TO TABLE
   *  ============================ */
  async assignOrder(
    restaurantId: string,
    tableId: string,
    orderId: string
  ) {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await updateDoc(ref, {
      currentOrderId: orderId,
      status: 'occupied',
      updatedAt: new Date().toISOString()
    });
  }

  /** ============================
   *   CLEAR ORDER (AFTER PAYMENT)
   *  ============================ */
  async clearOrder(restaurantId: string, tableId: string) {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await updateDoc(ref, {
      currentOrderId: null,
      status: 'available',
      updatedAt: new Date().toISOString()
    });
  }

  /** ============================
   *   CHANGE TABLE (MOVER CLIENTE)
   *  ============================ */
  async moveOrderToAnotherTable(
    restaurantId: string,
    fromTableId: string,
    toTableId: string
  ) {
    const fromRef = doc(this.firestore, `restaurants/${restaurantId}/tables/${fromTableId}`);
    const toRef = doc(this.firestore, `restaurants/${restaurantId}/tables/${toTableId}`);

    const fromSnap = await getDoc(fromRef);

    if (!fromSnap.exists()) throw new Error('Mesa origen no existe');

    const orderId = fromSnap.data()?.['currentOrderId'];
    if (!orderId) throw new Error('La mesa origen no tiene pedido activo');

    // liberar mesa origen
    await updateDoc(fromRef, {
      currentOrderId: null,
      status: 'available',
      updatedAt: new Date().toISOString()
    });

    // asignar a mesa destino
    await updateDoc(toRef, {
      currentOrderId: orderId,
      status: 'occupied',
      updatedAt: new Date().toISOString()
    });
  }

  /** ============================
   *   DELETE TABLE
   *  ============================ */
  async deleteTable(restaurantId: string, tableId: string) {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await deleteDoc(ref);
  }
}
