
export interface Order {
  orderId: string;
  restaurantId: string;
  tableId: string;
  tableNumber: number;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: any;
  updatedAt: any;
  // ❌ eliminar history de aquí
}

export type OrderStatus =
  | 'new'
  | 'approved'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'closed'
  | 'cancelled';

export interface OrderStatusChange {
  status: OrderStatus;
  timestamp: any;
  userId: string | null;
}
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  categoryId?: string;

  // opcionales
  description?: string;
  imageUrl?: string;
  createdAt?: string;
}
