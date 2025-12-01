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
import { User } from '../../../users/model/user.model';

@Injectable({ providedIn: 'root' })
export class RestaurantStaffService {
  constructor(private firestore: Firestore) {}

  // 🔹 Obtener restaurantId a partir del slug
  getRestaurantIdBySlug(slug: string): Observable<string> {
    const q = query(
      collection(this.firestore, 'restaurants'),
      where('slug', '==', slug)
    );
    return new Observable<string>((subscriber) => {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty)
            return subscriber.error(new Error('Restaurante no encontrado'));
          const restaurantId = snapshot.docs[0].id;
          subscriber.next(restaurantId);
        },
        (err) => subscriber.error(err)
      );
      return () => unsubscribe();
    });
  }

  // 🔥 OBTENER EMPLEADOS POR ID REAL DEL RESTAURANTE
  getRestaurantEmployeesByRestaurantId(
    restaurantId: string,
    showDisabled: boolean
  ): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');

    const q = query(
      usersRef,
      where('restaurantIds', 'array-contains', restaurantId),
      where('enabled', '==', !showDisabled) // enabled true o false
    );

    return collectionData(q, { idField: 'uid' }) as Observable<User[]>;
  }

  // 🔥 DESHABILITAR USUARIO
  async disableStaffMember(userId: string) {
    const ref = doc(this.firestore, `users/${userId}`);
    await updateDoc(ref, { enabled: false });
  }

  // 🔥 HABILITAR USUARIO
  async enableStaffMember(userId: string) {
    const ref = doc(this.firestore, `users/${userId}`);
    return await updateDoc(ref, { enabled: true });
  }
}
