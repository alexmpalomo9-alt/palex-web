import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Table } from '../model/tables.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  private firestore = inject(Firestore);

  /** Obtiene todas las mesas del restaurante */
  getTablesByRestaurant(restaurantId: string): Observable<Table[]> {
    const tablesRef = collection(this.firestore, `restaurants/${restaurantId}/tables`);
    return collectionData(tablesRef, { idField: 'tableId' }) as Observable<Table[]>;
  }

  /** Crear una nueva mesa */
  createTable(data: Partial<Table> & { restaurantId: string }) {
    const tablesRef = collection(this.firestore, `restaurants/${data.restaurantId}/tables`);
    return addDoc(tablesRef, data);
  }

  /** Actualizar mesa */
  updateTable(restaurantId: string, tableId: string, data: Partial<Table>) {
    const tableRef = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    return updateDoc(tableRef, data);
  }

  /** Eliminar mesa */
  deleteTable(restaurantId: string, tableId: string) {
    const tableRef = doc(this.firestore, `restaurants/${restaurantId}/tables/${tableId}`);
    return deleteDoc(tableRef);
  }

}
