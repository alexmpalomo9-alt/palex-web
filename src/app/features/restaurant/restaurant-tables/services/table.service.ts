import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, getDoc } from '@angular/fire/firestore';
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

  // ✔️ Verificar número repetido
  const exists = await this.existsTableNumber(data.restaurantId, Number(data.number));
  if (exists) {
    throw new Error(`Ya existe una mesa con el número ${data.number}`);
  }

  const ref = collection(this.firestore, `restaurants/${data.restaurantId}/tables`);
  const docRef = await addDoc(ref, {
    ...data,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return { tableId: docRef.id };
}
/** Verifica si ya existe una mesa con el mismo number */
async existsTableNumber(restaurantId: string, number: number): Promise<boolean> {
  const ref = collection(this.firestore, `restaurants/${restaurantId}/tables`);
  const q = query(ref, where('number', '==', number));
  const snap = await getDocs(q);
  return !snap.empty;
}

  /** Editar mesa */
async updateTable(restaurantId: string, tableId: string, data: Partial<Table>) {

  // ✔️ Solo validar si se está modificando el number
  if (data.number !== undefined) {
    const exists = await this.existsTableNumber(restaurantId, Number(data.number));

    if (exists) {
      // Verificar que NO sea el mismo documento
      const refCheck = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
      const original = await getDoc(refCheck);

      if (original.data()?.['number'] !== data.number) {
        throw new Error(`Ya existe una mesa con el número ${data.number}`);
      }
    }
  }

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
