import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Table } from '../model/tables.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  private firestore = inject(Firestore);

  /** Obtener todas las mesas del restaurante */
  getTablesByRestaurant(restaurantId: string): Observable<Table[]> {
    const ref = collection(this.firestore, `restaurants/${restaurantId}/tables`);
    return collectionData(ref, { idField: 'tableId' }) as Observable<Table[]>;
  }

  /** Crear mesa */
  async createTable(data: Partial<Table> & { restaurantId: string }) {
    const ref = collection(this.firestore, `restaurants/${data.restaurantId}/tables`);
    const docRef = await addDoc(ref, {
      ...data,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { tableId: docRef.id };
  }

  /** Editar mesa */
  async updateTable(restaurantId: string, tableId: string, data: Partial<Table>) {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
  }

  /** Eliminar mesa */
  async deleteTable(restaurantId: string, tableId: string) {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await deleteDoc(ref);
  }

  /** Habilitar/deshabilitar */
  async setTableEnabled(restaurantId: string, tableId: string, enabled: boolean) {
    const ref = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    await updateDoc(ref, {
      enabled,
      updatedAt: new Date().toISOString()
    });
  }
}
