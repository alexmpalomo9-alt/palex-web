import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
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

  // 🔹 Obtener empleados por slug
  getRestaurantEmployeesBySlug(
    slug: string,
    showDisabled = false
  ): Observable<User[]> {
    return this.getRestaurantIdBySlug(slug).pipe(
      switchMap(
        (restaurantId) =>
          new Observable<User[]>((subscriber) => {
            const q = query(
              collection(this.firestore, 'users'),
              where('restaurantsStaff', 'array-contains', restaurantId),
              where('enabled', '==', !showDisabled)
            );

            const unsubscribe = onSnapshot(
              q,
              (snapshot) => {
                const staff = snapshot.docs.map(
                  (doc) => ({ uid: doc.id, ...doc.data() } as User)
                );
                subscriber.next(staff);
              },
              (err) => subscriber.error(err)
            );

            return () => unsubscribe();
          })
      )
    );
  }
  async disableStaffMember(userUid: string) {
    const userRef = doc(this.firestore, `users/${userUid}`);
    await updateDoc(userRef, { enabled: false });
  }

  async enableStaffMember(userUid: string) {
    const userRef = doc(this.firestore, `users/${userUid}`);
    await updateDoc(userRef, { enabled: true });
  }
}
