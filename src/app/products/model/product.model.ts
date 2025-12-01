export interface Product {
  productId: string;
  restaurantId: string;
  name: string;
  price: number;
  available: boolean;
  description?: string;
  imageUrl?: string;
  category?: string;
  isOffer?: boolean;
  offerPrice?: number;

  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
}

export const PRODUCT_CATEGORIES = [
  'Entradas',
  'Platos Principales',
  'Bebidas',
  'Postres',
];
