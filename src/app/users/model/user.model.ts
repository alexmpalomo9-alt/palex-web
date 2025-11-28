export interface UserCredentials {
  email: string;
  password: string;
}

export interface User {
  uid: string;
  email: string;

  // Información personal opcional
  name: string;
  lastname: string;
  address?: string;
  birthdate?: string | null;
  phone?: string;
  photoURL?: string;

  // Roles del sistema
  roles: {
    // Roles internos (staff)
    adminGlobal: boolean;
    adminLocal: boolean;
    mozo: boolean;
    cocina: boolean;
    gerencia: boolean;

    // Roles externos (clientes)
    customer: boolean;
    guest: boolean;
  };

  // Relación con locales
  restaurantsOwner: string[]; // IDs donde es dueño - RELACIÓN DE PROPIEDAD - Permisos administrativos completos
  restaurantsStaff: string[]; // IDs donde es empleado - RELACIÓN DE EMPLEO - Permisos limitados segun rol

  // Estado
  enabled: boolean; // Habilitado o deshabilitado
  createdAt: string | null; // o Timestamp si preferís
}

export type UserDialogMode = 'editar-perfil' | 'editar-usuario';

export interface UserDialogData {
  user: User;
  modo: UserDialogMode;
}
