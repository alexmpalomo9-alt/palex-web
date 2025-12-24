export type PaymentMethod =
  | 'cash' //Cerrado (Efectivo)
  | 'qr' //Cerrado (QR)
  | 'mp_pos' //Cerrado (MP POS)
  | 'credit' //Cerrado (Crédito)
  | 'debit' //Cerrado (Débito)
  | 'other'; //Cerrado (Otros métodos de pago)

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
  paymentId?: string; // Firestore ID (autogenerado)
  orderId: string; // ID del pedido asociado
  restaurantId: string; // ID del restaurante asociado
  method: PaymentMethod; // Método de pago
  amount: number; // Monto pagado
  status: PaymentStatus; // Estado del pago
  transactionId?: string; // ID de transacción (si aplica)
  createdAt?: any;
  updatedAt?: any;
}
