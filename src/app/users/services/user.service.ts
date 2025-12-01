import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  updateDoc,
  setDoc,
  query,
  where,
  onSnapshot,
  DocumentReference,
  CollectionReference,
  QuerySnapshot,
  arrayUnion,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { User } from '../model/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private usersRef: CollectionReference;

  constructor(private firestore: Firestore) {
    this.usersRef = collection(this.firestore, 'users');
  }

  // -------------------------------------------------------------------
  // 🔵 Helper base para escuchar queries (reduce código duplicado)
  // -------------------------------------------------------------------
  private listenUsers(q: any): Observable<User[]> {
    return new Observable<User[]>((subscriber) => {
      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot) => {
          const users = snapshot.docs.map((docSnap) => ({
            uid: docSnap.id,
            ...docSnap.data(),
          })) as User[];
          subscriber.next(users);
        },
        (error) => subscriber.error(error)
      );

      return () => unsubscribe();
    });
  }
  // -------------------------------------------------------------------
  // 🟦 Actualizar usuario
  // -------------------------------------------------------------------

  async updateUser(uid: string, partialData: Partial<User>): Promise<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, {
      ...partialData,
      updatedAt: new Date().toISOString(),
    });
  }
  // -------------------------------------------------------------------
  // 🟩 Obtener un usuario por UID
  // -------------------------------------------------------------------

  getUser(uid: string): Observable<User | null> {
    return new Observable<User | null>((subscriber) => {
      const userRef: DocumentReference = doc(this.firestore, `users/${uid}`);

      const unsubscribe = onSnapshot(
        userRef,
        (snap) => {
          if (!snap.exists()) {
            subscriber.next(null);
            return;
          }
          subscriber.next({
            uid: snap.id,
            ...snap.data(),
          } as User);
        },
        (error) => subscriber.error(error)
      );

      return () => unsubscribe();
    });
  }
}
