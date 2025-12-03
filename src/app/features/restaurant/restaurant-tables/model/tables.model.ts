export interface Table {
  tableId: string; // ID único
  restaurantId: string; // A qué restaurante pertenece
  number: number; // Número visible para el personal
  name?: string; // Opcional: “Patio 1”, “Mesa VIP”
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string; // Pedido activo
  qrCode?: string; // // JSON o link codificado → genera la imagen QR
  qrSlug: string; // cadena corta que usamos en URL para identificar mesa
  sector?: string; // opcional
  capacity: number; // capacidad nominal

  createdAt: string;
  updatedAt?: string;
}

export const TABLES_COLLECTION = 'tables';
