
export interface Category {
  categoryId?: string; // id en Firestore
  restaurantId: string;
  name: string;
  slug?: string; // opcional, para urls / accesibilidad
  order?: number; // para ordenar en UI
  enabled?: boolean;
  createdAt?: any;
  updatedAt?: any;
}
