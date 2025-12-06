export interface Product {
  productId: string;
  restaurantId: string;
  name: string;
  price: number;
  available: boolean;
  description?: string;
  imageUrl?: string;
  isOffer?: boolean;
  offerPrice?: number;

  categoryId: string;
  categoryName?: string; // opcional, para mostrar sin pedir FS
  createdAt?: string;
  updatedAt?: string;
}

