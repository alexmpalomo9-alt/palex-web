import { CartItem } from "../customer/components/cart/model/cart.model";

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled';

export interface Order {
  orderId?: string;
  restaurantId: string;
  mesaId?: string | null;      // si aplica
  userId?: string | null;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}
