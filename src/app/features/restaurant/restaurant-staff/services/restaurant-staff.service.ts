import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  collectionData,
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
  // 🔥 Obtener empleados de un restaurante
  // ==========================================================
  getRestaurantEmployeesByRestaurantId(
    restaurantId: string
  ): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');

    const q = query(
      usersRef,
      where('restaurantIds', 'array-contains', restaurantId)
    );

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

    // 1. Eliminar este restaurantId del array
    await updateDoc(userRef, {
      restaurantIds: arrayRemove(restaurantId),
    });

    // 2. Eliminar roles locales específicos del restaurante
    await updateDoc(userRef, {
      [`localRoles.${restaurantId}`]: deleteField(),
    });
  }
}
