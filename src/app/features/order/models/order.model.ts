import { PaymentMethod } from '../../restaurant/restaurant-orders/payment/model/payment.model';

export interface Order {
  orderId: string;
  restaurantId: string;

  // Mesas
  tableIds: string[];
  tableNumbers: number[]; // 🔥 DESNORMALIZADO

  // Usuario (mozo o invitado)
  waiterId?: string;  // Si es un mozo logueado
  waiterName?: string;  // Si es un mozo logueado
  waiterRole?: string;  // Si es un mozo logueado

  guestId?: string;  // Si es un invitado, puede ser un UUID generado
  guestName?: string;  // Si es un invitado

  // **Asegúrate de agregar esto**
  createdBy: string;  // El creador del pedido, ya sea mozo o invitado

  // Estado
  status: OrderStatus;
  total: number;
  itemsCount: number;

  // Extras
  notes?: string;

  paymentMethod?: PaymentMethod;

  createdAt: any;
  updatedAt: any;

  // Feedback al mozo
  lastUpdateDecision?: 'accepted' | 'rejected';
  lastUpdateAt?: any;

  // Solicitud viva (si existe)
  pendingUpdate?: {
    total: number;
    items: OrderItem[];
    notes: string;
    requestedAt: any;
    kitchenDecision?: 'accepted' | 'rejected'; // opcional
  };
}

export type OrderStatus =
  | 'draft' // Cliente/mozo creando pedido
  | 'pending' // Cliente envió pedido, espera aprobación del mozo
  | 'updated' // Pedido modificado (agregar/quitar items) estando ya en proceso
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
