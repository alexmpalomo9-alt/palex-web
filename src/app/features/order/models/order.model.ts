export interface Order {
  orderId: string;
  restaurantId: string;

  // Mesa
  tableIds: string[];  //Lista de mesas
  
  tableNumber?: number;
  sector?: string;
  capacity?: number;

  // Estado
  status: OrderStatus;
  total: number;
  itemsCount: number;

  // Usuarios
  waiter?: string; // mozo asignado
  createdBy?: string; // waiter | customer

  // Extras
  notes?: string;
  items?: OrderItem[];

  createdAt: any;
  updatedAt: any;
  closedAt?: any;
  cancelledAt?: any;
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
  | 'closed_cash'
  | 'closed_qr'
  | 'closed_mp_pos'
  | 'closed_credit'
  | 'closed_debit'
  | 'closed_house'
  | 'closed_other'
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
