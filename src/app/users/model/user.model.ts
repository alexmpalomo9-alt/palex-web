export interface UserCredentials {
  email: string;
  password: string;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  lastname: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  birthdate?: string;

  enabled: boolean;

  // Roles globales
  globalRoles: {
    adminGlobal: boolean;
    customer: boolean;
    guest: boolean;
  };

  // Roles locales por restaurante
  localRoles?: {
    [restaurantId: string]: {
      adminLocal?: boolean;
      mozo?: boolean;
      cocina?: boolean;
      manager?: boolean;
    };
  };
  
  // Nuevo campo para filtrado eficiente
  restaurantIds: string[];

  createdAt: string;
  updatedAt?: string;
}

export type UserDialogMode = 'editar-perfil' | 'editar-usuario';

export interface UserDialogData {
  user: User;
  modo: UserDialogMode;
}
