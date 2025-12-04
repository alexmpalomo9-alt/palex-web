export interface Order {
  orderId: string;
  restaurantId: string;
  tableId: string;
  tableNumber: number;

  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

  items: OrderItem[];
  total: number;
  notes?: string;

  createdAt: string;
  updatedAt: string;
  closedAt?: string;

  history: OrderStatusChange[];
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  categoryId: string;

  // opcionales
  description?: string;
  imageUrl?: string;
}

export interface OrderStatusChange {
  status: string;
  timestamp: string;
  userId?: string; // mozo/cocina que hizo cambio
}
