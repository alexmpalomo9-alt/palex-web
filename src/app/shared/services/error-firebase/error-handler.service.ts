import { Injectable } from '@angular/core';
import { FirebaseError } from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  handleFirebaseError(error: FirebaseError): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Este correo ya está en uso. Por favor, utiliza otro.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico es inválido.';
      case 'auth/operation-not-allowed':
        return 'La operación no está permitida.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/user-not-found':
        return 'Usuario no encontrado.';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta.';
      case 'auth/invalid-credential':
        return 'Las credenciales proporcionadas no son válidas. Verifica tu correo o contraseña.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intente más tarde.';
      default:
        return 'Ocurrió un error: ' + error.message;
    }
  }

  log(error: any) {
    // console.error('Error capturado:', error);
    // Aquí podrías hacer logging a un servicio externo si deseas
  }
}
