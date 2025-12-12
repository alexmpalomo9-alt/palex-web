export interface Table {
  tableId: string; // ID único
  restaurantId: string; // A qué restaurante pertenece
  number: number; // Número visible para el personal
  name?: string; // Opcional: “Patio 1”, “Mesa VIP”
  status: TableStatus;   // estados mesa
  currentOrderId?: string | null; // Pedido activo
  qrCode?: string; // // JSON o link codificado → genera la imagen QR
  qrSlug: string; // cadena corta que usamos en URL para identificar mesa
  sector?: string; // opcional
  capacity: number; // capacidad nominal
  tableIds: string[]; 
  createdAt: string;
  updatedAt?: string;
}

export const TABLES_COLLECTION = 'tables';

export interface Closing {
  closingId: string;
  restaurantId: string;
  tableId: string;
  tableNumber: number;
  orderId: string;

  total: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'other';

  createdAt: string;
  userId: string; // cajero
}

export type TableStatus =
  | 'available' // Libre
  | 'seated' // Cliente sentado pero aún sin pedido
  | 'occupied' // Tiene pedido activo
  | 'reserved'; // Tiene reserva
