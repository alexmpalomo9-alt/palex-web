import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
} from '@angular/fire/auth';
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  signInWithPopup,
} from 'firebase/auth';
import {
  Firestore,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirebaseError } from 'firebase/app';
import { User, UserCredentials } from '../../../users/model/user.model';
import { ErrorHandlerService } from '../../../shared/services/error-firebase/error-handler.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private errorHandler: ErrorHandlerService
  ) {
    // Persistencia en localStorage
    setPersistence(this.auth, browserLocalPersistence).catch(console.error);

    // Listener de cambios en auth
    onAuthStateChanged(this.auth, async (user) => {
      const logged = !!user;
      this.isLoggedInSubject.next(logged);

      if (!user) {
        this.currentUserSubject.next(null);
        return;
      }

      const userData = await this.getUserData(user.uid);
      this.currentUserSubject.next(userData);
    });
  }

  // -------------------------------------------------------------
  // LOGIN EMAIL/PASSWORD
  // -------------------------------------------------------------
  async login({ email, password }: UserCredentials) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      this.handleError(error);
    }
  }

  // -------------------------------------------------------------
  // LOGIN GOOGLE
  // -------------------------------------------------------------
  async loginWithGoogle() {
    try {
      const credentials = await signInWithPopup(
        this.auth,
        new GoogleAuthProvider()
      );
      const user = credentials.user;

      let existingUser = await this.getUserData(user.uid);

      if (!existingUser) {
        const displayName = user.displayName ?? '';
        const names = displayName.split(' ');
        const name = names.shift() || '';
        const lastname = names.join(' ') || '';

        await this.saveUser(user.uid, {
          uid: user.uid,
          email: user.email ?? '',
          name,
          lastname,
          photoURL: user.photoURL ?? '',
          // Roles globales
          globalRoles: {
            adminGlobal: false,
            customer: true,
            guest: false,
          },

          // Roles locales por restaurante (vacío por defecto)
          localRoles: {},

          enabled: true,
          createdAt: new Date().toISOString(),
        });

        existingUser = await this.getUserData(user.uid);
      }

      return { uid: user.uid };
    } catch (error) {
      this.handleError(error);
    }
  }

  // -------------------------------------------------------------
  // REGISTER NORMAL USER
  // -------------------------------------------------------------
async registerUser({ name, lastname, email, password }: any) {
  try {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = cred.user;

    // Verificar si el usuario ya existe en Firestore
    const existingUser = await this.getUserData(user.uid);
    if (existingUser) {
      console.log('Usuario ya existe en Firestore');
      return; // Evitar guardar el usuario de nuevo
    }

    await this.saveUser(user.uid, {
      uid: user.uid,
      email,
      name,
      lastname,
      globalRoles: { adminGlobal: false, customer: true, guest: false },
      localRoles: {},
      enabled: true,
      createdAt: new Date().toISOString(),
    });

    return user.uid;
  } catch (error) {
    this.handleError(error);
  }
}
  // -------------------------------------------------------------
  // GET USER DATA
  // -------------------------------------------------------------
  async getUserData(userId: string): Promise<User | null> {
    const userRef = doc(this.firestore, `users/${userId}`);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return null;

    const data = snap.data() as any;

    // Aseguramos arrays
    data.restaurantsOwner = data.restaurantsOwner ?? [];
    data.restaurantsStaff = data.restaurantsStaff ?? [];

    // Limpiamos roles antiguos por compatibilidad
    const oldLocalRoles = ['adminLocal', 'mozo', 'cocina', 'manager'];
    if (data.roles) {
      const hasOld = oldLocalRoles.some((r) => data.roles[r]);
      if (hasOld) {
        console.warn(
          '⚠ Se detectaron roles locales antiguos. Se ignorarán porque no sabemos a qué restaurante pertenecen.'
        );
        oldLocalRoles.forEach((r) => delete data.roles[r]);
      }
    }

    return data as User;
  }

  // -------------------------------------------------------------
  // SAVE USER
  // -------------------------------------------------------------
  async saveUser(uid: string, data: Partial<User>) {
    const userRef = doc(this.firestore, `users/${uid}`);
    return setDoc(userRef, { uid, ...data }, { merge: true });
  }

  // -------------------------------------------------------------
  // ADD STAFF TO RESTAURANT
  // -------------------------------------------------------------
  async addUserToRestaurant(userId: string, restaurantId: string) {
    const userRef = doc(this.firestore, `users/${userId}`);

    // solo agregamos el ID del restaurante al array
    return updateDoc(userRef, {
      restaurantsStaff: arrayUnion(restaurantId),
    });
  }

  // -------------------------------------------------------------
  // LOGOUT
  // -------------------------------------------------------------
  async logout() {
    await signOut(this.auth);
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    localStorage.removeItem('lastActivity');
  }

  // -------------------------------------------------------------
  // GET CURRENT USER
  // -------------------------------------------------------------
  getCurrentUser(): Promise<User | null> {
    return Promise.resolve(this.currentUserSubject.value);
  }

  // -------------------------------------------------------------
  // SEND RESET PASSWORD EMAIL
  // -------------------------------------------------------------
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      console.error('Error al enviar email de reset:', error);
      throw new Error(
        'No pudimos enviar el email. Revisá que el correo esté registrado.'
      );
    }
  }

  // -------------------------------------------------------------
  // ERROR HANDLER
  // -------------------------------------------------------------
  private handleError(error: any): never {
    if (error instanceof FirebaseError) {
      throw new Error(this.errorHandler.handleFirebaseError(error));
    }
    console.error('Error desconocido:', error);
    throw new Error('Error desconocido durante la autenticación.');
  }

  // -------------------------------------------------------------
  // GET USER ID DIRECTO
  // -------------------------------------------------------------
  getUserID(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  // -------------------------------------------------------------
// SNAPSHOT DEL USUARIO LOGUEADO (SIN LECTURAS)
// -------------------------------------------------------------
getUserSnapshot(): {
  uid: string;
  name: string;
  role: string;
} {
  const user = this.currentUserSubject.value;

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // Nombre completo para display
  const name = `${user.name ?? ''} ${user.lastname ?? ''}`.trim();

  // ⚠️ Ajustá esta lógica según tu modelo real de roles
  // Ejemplo: mozo por restaurante
  const role =
    user.globalRoles?.adminGlobal
      ? 'Admin'
      : 'Mozo';

  return {
    uid: user.uid,
    name,
    role,
  };
}

}
