import { PaymentMethod } from '../../restaurant/restaurant-orders/payment/model/payment.model';

export interface Order {
  orderId: string;
  restaurantId: string;

  // Mesas
  tableIds: string[];
  tableNumbers: number[]; // 🔥 DESNORMALIZADO

  // Usuario
  waiterId?: string;
  waiterName?: string; // 🔥 DESNORMALIZADO
  waiterRole?: string; // 🔥 DESNORMALIZADO

  // Estado
  status: OrderStatus;
  total: number;
  itemsCount: number;

  // Extras
  notes?: string;

  paymentMethod?: PaymentMethod;

  createdAt: any;
  updatedAt: any;
}

export type OrderStatus =
  | 'draft' // Cliente/mozo creando pedido
  | 'pending' // Cliente envió pedido, espera aprobación del mozo
  | 'updated' // Pedido modificado (agregar/quitar items) estando ya en proceso
  | 'update_rejected' //Desde cocina rechazan la modificacion del pedido
  | 'approved' // Pedido aprobado (por mozo)
  | 'preparing' // Cocina recibio el pedido y esta preparando el pedido
  | 'ready' // Cocina terminó el pedido
  | 'delivered' // Mozo entregó el pedido al cliente
  | 'closed' // Pedido cobrado / finalizado
  | 'cancelled'; // Pedido anulado

//Historial
export interface OrderStatusChange {
  status: OrderStatus;
  timestamp: any;
  userId: string | null;
}
export interface OrderItem {
  itemId?: string; // Firestore ID (autogenerado)
  productId: string; // ID del producto
  name: string; // Nombre del producto
  price: number; // Precio unitario
  qty: number; // Cantidad
  subtotal: number; // price * qty
  position: number; // Orden visual
  notes?: string; // Observaciones opcionales
  createdAt?: any;
  updatedAt?: any;
}
