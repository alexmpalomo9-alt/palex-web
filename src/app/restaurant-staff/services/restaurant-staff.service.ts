import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
  onSnapshot,
  CollectionReference,
  QuerySnapshot,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../../users/model/user.model';

@Injectable({ providedIn: 'root' })
export class RestaurantStaffService {

  constructor(private firestore: Firestore) {}

  // -------------------------------------------------------------------
  // 🔵 Helper genérico para escuchar usuarios
  // -------------------------------------------------------------------
  private listenUsers(q: any): Observable<User[]> {
    return new Observable<User[]>((subscriber) => {
      // onSnapshot ahora usa this.firestore context correctamente
      const unsubscribe = onSnapshot(
        q,
        (snapshot: { docs: any[]; }) => {
          const list = snapshot.docs.map(docSnap => ({
            uid: docSnap.id,
            ...docSnap.data(),
          })) as User[];
          subscriber.next(list);
        },
        (error) => subscriber.error(error)
      );

      return () => unsubscribe();
    });
  }

  // -------------------------------------------------------------------
  // 🟩 Staff
  // -------------------------------------------------------------------
  async addStaffToRestaurant(userUid: string, restaurantId: string) {
    const userRef = doc(this.firestore, `users/${userUid}`);
    await updateDoc(userRef, {
      restaurantsStaff: arrayUnion(restaurantId),
      updatedAt: new Date().toISOString(),
      enabled: true,
    });
  }

  async disableStaffMember(userUid: string) {
    const userRef = doc(this.firestore, `users/${userUid}`);
    await updateDoc(userRef, { enabled: false, updatedAt: new Date().toISOString() });
  }

  async enableStaffMember(userUid: string) {
    const userRef = doc(this.firestore, `users/${userUid}`);
    await updateDoc(userRef, { enabled: true, updatedAt: new Date().toISOString() });
  }

  getActiveStaff(restaurantId: string): Observable<User[]> {
    const q = query(
      collection(this.firestore, 'users'),
      where('restaurantsStaff', 'array-contains', restaurantId),
      where('enabled', '==', true)
    );
    return this.listenUsers(q);
  }

  getDisabledStaff(restaurantId: string): Observable<User[]> {
    const q = query(
      collection(this.firestore, 'users'),
      where('restaurantsStaff', 'array-contains', restaurantId),
      where('enabled', '==', false)
    );
    return this.listenUsers(q);
  }

  getRestaurantStaff(restaurantId: string): Observable<User[]> {
    return this.getActiveStaff(restaurantId);
  }
}
