
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number; // cantidad de este producto en el carrito
  // guardamos categoryId opcionalmente para mostrar info rápida
  categoryId?: string;
}

export interface Cart {
  userId?: string | null;       // opcional si tenés usuarios
  restaurantId: string;
  items: CartItem[];
  createdAt?: any;
  updatedAt?: any;
}
