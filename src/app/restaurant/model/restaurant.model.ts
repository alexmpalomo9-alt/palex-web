export interface Restaurant {
  restaurantId: string;
  name: string;
  
  // Dirección simple (MVP)
  address: string;
  addressNumber: number;

  description?: string;
  imageLogo?: string;
  mainImage?: string;
  phone?: string;

  slug: string; // URL amigable

  enabled: boolean; // Para cambiar estado sin borrar

  // Membresía (REEMPLAZADO - no boolean)
  membershipPlan: 'free' | 'premium'; 

  // Relación con dueños
  ownerIds: string[]; // UIDs de usuarios dueños

  // Data adicional
  category?: string;
  openingHours?: string;

  // Para valoraciones futuras
  rating?: number;

  // Timestamps
  createdAt: string;  // ISO string
  updatedAt?: string; // ISO string cargado por acción
}

export type RestaurantDialogMode = 'edit' | 'create';

export interface RestaurantDialogData {
  restaurant: Restaurant;
  mode: RestaurantDialogMode;
}

export const RESTAURANT_COLLECTION = 'restaurants';
