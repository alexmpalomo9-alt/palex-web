// invitation.service.ts (añadir/editar)
import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  constructor(private firestore: Firestore) {}

  async createInvitation(
    restaurantId: string,
    email: string | null,
    role: string = 'employee'
  ) {
    const token = crypto.randomUUID();
    const ref = doc(this.firestore, `restaurantInvitations/${token}`);
    await setDoc(ref, {
      restaurantId,
      email,
      role,
      token,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return token;
  }

  // NUEVO: crea un token genérico (link para compartir) — devuelve la URL completa
  async createJoinLink(restaurantId: string, role: string) {
    const token = crypto.randomUUID();

    const ref = doc(this.firestore, `restaurantInvitations/${token}`);

    await setDoc(ref, {
      token,
      restaurantId,
      role,
      createdAt: serverTimestamp(),
      status: 'pending',
      email: null, // Al ser un link compartible público
      public: true, // marca que es link compartible
    });
    // Cambia la base de tu url según ambiente
    return `${location.origin}/invite/${token}`;
  }

  async getInvitation(token: string) {
    const ref = doc(this.firestore, `restaurantInvitations/${token}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }

  async acceptInvitation(token: string, userId: string) {
    const ref = doc(this.firestore, `restaurantInvitations/${token}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Invitación no encontrada');

    const data: any = snap.data();
    const restaurantId = data.restaurantId;
    const role = data.role; // adminLocal | mozo | cocina | manager

    // 1) Actualizar staff del restaurante
    const staffRef = doc(
      this.firestore,
      `restaurants/${restaurantId}/staff/${userId}`
    );
    await setDoc(staffRef, {
      role,
      joinedAt: serverTimestamp(),
      invitationToken: token,
    });

    // 2) Actualizar usuario
    const userRef = doc(this.firestore, `users/${userId}`);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('Usuario no encontrado');
    const user: any = userSnap.data();

    // Inicializar arrays si no existen
    user.restaurantIds = user.restaurantIds ?? [];
    user.localRoles = user.localRoles ?? {};

    // Agregar restaurante al array
    if (!user.restaurantIds.includes(restaurantId)) {
      user.restaurantIds.push(restaurantId);
    }

    // Guardar roles locales específicos de ese restaurante
    user.localRoles[restaurantId] = {
      adminLocal: role === 'adminLocal',
      mozo: role === 'mozo',
      cocina: role === 'cocina',
      manager: role === 'manager',
    };

    // Guardar roles globales si aplica (opcional, normalmente no cambia)
    user.globalRoles = user.globalRoles ?? {
      adminGlobal: false,
      customer: true,
      guest: false,
    };

    await updateDoc(userRef, user);

    // 3) Marcar invitación como aceptada
    await updateDoc(ref, {
      status: 'accepted',
      acceptedBy: userId,
      acceptedAt: serverTimestamp(),
    });

    return { restaurantId, role };
  }

  // opcional: invalidar o borrar una invitación
  async revokeInvitation(token: string) {
    const ref = doc(this.firestore, `restaurantInvitations/${token}`);
    await updateDoc(ref, {
      status: 'revoked',
      revokedAt: serverTimestamp(),
    });
  }
}
