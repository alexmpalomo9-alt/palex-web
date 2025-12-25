import { OrderStatus } from '../../models/order.model';

export interface OrderStatusConfig {
  label: string;
  color: string;
  canUpdate: boolean;
  canCancel: boolean;
  kitchenLabel?: string;
  visibleInKitchen: boolean;
}
export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  draft: {
    label: 'Borrador',
    color: 'var(--status-draft)',
    canUpdate: false,
    canCancel: false,
    visibleInKitchen: false,
  },

  pending: {
    label: 'Pendiente',
    color: 'var(--status-pending)',
    canUpdate: false,
    canCancel: true,
    visibleInKitchen: false,
  },

  approved: {
    label: 'Aprobado',
    kitchenLabel: 'Nuevo',
    color: 'var(--status-approved)',
    canUpdate: true,
    canCancel: true,
    visibleInKitchen: true,
  },

  updated: {
    label: 'Actualizado',
    kitchenLabel: 'Actualizado',
    color: 'var(--status-updated)',
    canUpdate: true,
    canCancel: true,
    visibleInKitchen: true,
  },

  preparing: {
    label: 'En preparación',
    kitchenLabel: 'En preparación',
    color: 'var(--status-preparing)',
    canUpdate: true,
    canCancel: true,
    visibleInKitchen: true,
  },

  ready: {
    label: 'Listo para entregar',
    kitchenLabel: 'Listo',
    color: 'var(--status-ready)',
    canUpdate: false,
    canCancel: true,
    visibleInKitchen: true,
  },

  delivered: {
    label: 'Entregado',
    color: 'var(--status-delivered)',
    canUpdate: false,
    canCancel: false,
    visibleInKitchen: false,
  },

  closed: {
    label: 'Cerrado',
    color: 'var(--status-closed)',
    canUpdate: false,
    canCancel: false,
    visibleInKitchen: false,
  },

  cancelled: {
    label: 'Cancelado',
    color: 'var(--status-cancelled)',
    canUpdate: false,
    canCancel: false,
    visibleInKitchen: false,
  },
};
