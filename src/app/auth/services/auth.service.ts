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
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { regexMail } from '../../shared/pattern/patterns';
import { FirebaseError } from 'firebase/app';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { User, UserCredentials } from '../../users/model/user.model';

@Injectable({
  providedIn: 'root',
})
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
    /** Persistencia */
    setPersistence(this.auth, browserLocalPersistence).catch((error) =>
      console.error('Error al establecer persistencia:', error)
    );

    /** Listener de login */
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

  // -------------------- GETTER PÚBLICO --------------------
  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  // -------------------- LOGIN EMAIL/PASSWORD --------------------
  async login({ email, password }: UserCredentials) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      this.handleError(error);
    }
  }

  // -------------------- LOGIN GOOGLE --------------------
  async loginWithGoogle() {
    try {
      const credentials = await signInWithPopup(
        this.auth,
        new GoogleAuthProvider()
      );
      const user = credentials.user;

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
        roles: {
          adminGlobal: false,
          adminLocal: false,
          mozo: false,
          cocina: false,
          gerencia: false,
          customer: true,
          guest: false,
        },
        restaurantsOwner: [],
        restaurantsStaff: [],
        enabled: true,
        createdAt: new Date().toISOString(),
      });

      return { uid: user.uid };
    } catch (error) {
      this.handleError(error);
    }
  }

  // -------------------- REGISTER --------------------
  async registerUser({ name, lastname, email, password }: any) {
    const cred = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    const user = cred.user;

    await this.saveUser(user.uid, {
      uid: user.uid,
      email,
      name,
      lastname,
      roles: {
        adminGlobal: false,
        adminLocal: false,
        mozo: false,
        cocina: false,
        gerencia: false,
        customer: true,
        guest: false,
      },
      restaurantsOwner: [],
      restaurantsStaff: [],
      enabled: true,
      createdAt: new Date().toISOString(),
    });

    return user.uid;
  }

  // -------------------- GET USER DATA --------------------
  async getUserData(userId: string): Promise<User | null> {
    const userRef = doc(this.firestore, `users/${userId}`);
    const snap = await getDoc(userRef);
    return snap.exists() ? (snap.data() as User) : null;
  }

  // -------------------- SAVE USER DATA --------------------
  async saveUser(uid: string, data: Partial<User>) {
    const userRef = doc(this.firestore, `users/${uid}`);
    return setDoc(userRef, { uid, ...data }, { merge: true });
  }

  // -------------------- LOGOUT --------------------
  async logout() {
    await signOut(this.auth);
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    localStorage.removeItem('lastActivity');
  }

    // -------------------- GET USER LOGUEADO --------------------
  getCurrentUser(): Promise<User | null> {
  return Promise.resolve(this.currentUserSubject.value);
}


  // -------------------- RESET PASSWORD --------------------
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

  // -------------------- UTILITIES --------------------
  private handleError(error: any): never {
    if (error instanceof FirebaseError) {
      throw new Error(this.errorHandler.handleFirebaseError(error));
    }
    console.error('Error desconocido:', error);
    throw new Error('Error desconocido durante la autenticación.');
  }

  getUserID(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }
}
