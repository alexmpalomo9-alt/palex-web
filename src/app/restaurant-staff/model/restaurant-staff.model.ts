export interface RestaurantStaff {
  staffId: string;           
  restaurantId: string;       
  userId: string;             

  // Rol interno dentro del restaurante
  role: 'adminLocal' | 'camarero' | 'chef' | 'gerencia';

  // Quién lo creó o invitó
  invitedBy?: string;       

  // Estado
  enabled: boolean;          

  // Timestamps (Firestore-friendly)
  createdAt: string;          // ISO string
  updatedAt?: string;         // ISO string
}

export const RESTAURANT_STAFF_COLLECTION = 'restaurantStaff';
