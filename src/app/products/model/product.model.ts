export interface Product {
  productId: string;
  name: string;
  price: number;
  available: boolean;
  description?: string;
  imageUrl?: string;
  category?: string;
  isOffer?: boolean;
  offerPrice?: number;
  createdAt?: string;
  updatedAt?: string;
  restaurantId: string;
}

export const PRODUCT_CATEGORIES = [
  'Entradas',
  'Platos principales',
  'Bebidas',
  'Postres',
];
