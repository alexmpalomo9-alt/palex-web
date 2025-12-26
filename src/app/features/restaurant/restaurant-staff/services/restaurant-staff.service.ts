import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  collectionData,
  DocumentSnapshot,
  limit,
  startAfter,
  writeBatch, // Utilizamos un batch para operaciones atómicas
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { deleteField, arrayRemove } from '@angular/fire/firestore';
import { User } from '../../../../users/model/user.model';

@Injectable({ providedIn: 'root' })
export class RestaurantStaffService {
  constructor(private firestore: Firestore) {}

  // ==========================================================
  // 🔹 Obtener restaurantId desde el slug
  // ==========================================================
  getRestaurantIdBySlug(slug: string): Observable<string> {
    const q = query(
      collection(this.firestore, 'restaurants'),
      where('slug', '==', slug)
    );

    return new Observable<string>((subscriber) => {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            subscriber.error(new Error('Restaurante no encontrado'));
            return;
          }

          const restaurantId = snapshot.docs[0].id;
          subscriber.next(restaurantId);
        },
        (err) => subscriber.error(err)
      );

      return () => unsubscribe();
    });
  }

  // ==========================================================
  // 🔥 Obtener empleados de un restaurante con paginación
  // ==========================================================
  getRestaurantEmployeesByRestaurantId(
    restaurantId: string,
    pageSize: number = 10,
    lastDoc: DocumentSnapshot | null = null
  ): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');

    let q = query(
      usersRef,
      where('restaurantIds', 'array-contains', restaurantId),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc)); // Continuar desde el último documento obtenido
    }

    return collectionData(q, { idField: 'uid' }) as Observable<User[]>;
  }

  // ==========================================================
  // 🔥 Eliminar un empleado SOLO de este restaurante
  // ==========================================================
  async removeUserFromRestaurant(
    userId: string,
    restaurantId: string
  ): Promise<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    const batch = writeBatch(this.firestore); // Usamos un batch para operaciones atómicas

    // 1. Eliminar este restaurantId del array
    batch.update(userRef, {
      restaurantIds: arrayRemove(restaurantId),
    });

    // 2. Eliminar roles locales específicos del restaurante
    batch.update(userRef, {
      [`localRoles.${restaurantId}`]: deleteField(),
    });

    // Ejecutamos todas las operaciones de forma atómica
    await batch.commit();
  }

  // ==========================================================
  // 🔥 Obtener el siguiente lote de empleados
  // ==========================================================
  getNextPageOfEmployees(
    restaurantId: string,
    pageSize: number = 10,
    lastDoc: DocumentSnapshot
  ): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    
    const q = query(
      usersRef,
      where('restaurantIds', 'array-contains', restaurantId),
      startAfter(lastDoc), // Paginación con el último documento
      limit(pageSize)
    );

    return collectionData(q, { idField: 'uid' }) as Observable<User[]>;
  }
}
