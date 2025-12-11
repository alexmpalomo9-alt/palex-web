import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DialogService } from '../../../../core/services/dialog.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { OrderDialogService } from '../../services/order-dialog/order-dialog.service';
import { OrderItemService } from '../../../order/services/order-item/order-item.service';
import { MatDialog } from '@angular/material/dialog';
import { MenuDialogComponent } from '../../../restaurant/restaurant-menu/menu-dialog/menu-dialog.component';
import { PaymentMethodDialogComponent } from '../../../restaurant/restaurant-orders/payment-method-dialog/payment-method-dialog.component';

export interface OrderDialogState {
  items: any[];
  notes: string;
  status: string;
  isEditMode: boolean;

  originalItems: any[];
  originalNotes: string;

  loading: boolean;

  restaurantId: string;
  tableId: string;
  tableNumber: number;
  orderId?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderDialogFacade {
  // ---------------------------
  // 🟩 Estado centralizado (usar initialState para inicializar)
  // ---------------------------
  private initialState(): OrderDialogState {
    return {
      items: [],
      notes: '',
      status: 'draft',
      isEditMode: false,
      originalItems: [],
      originalNotes: '',
      loading: false,
      restaurantId: '',
      tableId: '',
      tableNumber: 0,
      orderId: undefined,
    };
  }

  state = signal<OrderDialogState>(this.initialState());

  // ---------------------------
  // Constructor
  // ---------------------------
  constructor(
    private orderService: OrderDialogService,
    private dialog: DialogService,
    private auth: AuthService,
    private orderItemService: OrderItemService,
    private matDialog: MatDialog
  ) {}

  // ---------------------------
  // 🟦 Reset / helpers de estado
  // ---------------------------
  resetState() {
    this.state.set(this.initialState());
  }

  // ---------------------------
  // 🟦 Inicializar el dialog
  // ---------------------------
  /**
   * data esperado:
   * {
   *   restaurantId,
   *   tableId,
   *   tableNumber,
   *   orderId? ,
   *   forceNew?: boolean
   * }
   */
  initialize(data: any) {
    // Si la mesa cambió o nos piden forzar nueva sesión, reseteamos
    if (
      data?.forceNew ||
      (data?.tableId && this.state().tableId !== data.tableId)
    ) {
      this.resetState();
    }

    this.state.update((s) => ({
      ...s,
      restaurantId: data.restaurantId,
      tableId: data.tableId,
      tableNumber: data.tableNumber,
      orderId: data.orderId ?? undefined,
    }));

    if (data?.orderId) {
      // cargamos la orden existente
      void this.loadOrder();
    }
  }

  // ---------------------------
  // 🟩 Cargar Orden (desde backend) - normaliza cantidades y notas
  // ---------------------------
  async loadOrder() {
    const { restaurantId, orderId } = this.state();
    if (!restaurantId || !orderId) return;

    const order = await this.orderService.loadOrder(restaurantId, orderId!);
    if (!order) return;

    const normalizeItem = (i: any) => ({
      ...i,
      qty: Number(i.qty ?? 1),
      price: Number(i.price ?? 0),
    });

    const normalizedItems = (order.items ?? []).map(normalizeItem);

    this.state.update((s) => ({
      ...s,
      items: normalizedItems,
      notes: order.notes ?? '',
      status: order.status ?? 'draft',
      isEditMode: (order.status ?? 'draft') !== 'draft',
      originalItems: structuredClone(normalizedItems),
      originalNotes: order.notes ?? '',
    }));
  }

  // ---------------------------
  // 🟦 Label de estado
  // ---------------------------
  getOrderStatusLabel(status: string): string {
    const map: Record<string, string> = {
      draft: 'Borrador',
      approved: 'Aprobado',
      preparing: 'En preparación',
      closed: 'Cerrado',
      cancelled: 'Cancelado',
      updated: 'Actualizado',
    };
    return map[status] ?? 'Desconocido';
  }

  // ---------------------------
  // 🟩 Agregar Item (desde diálogo de menú)
  // ---------------------------
  async addItemDialog() {
    const restaurantId = this.state().restaurantId;
    const dialogRef = this.matDialog.open(MenuDialogComponent, {
      disableClose: true,
      data: { restaurantId },
    });

    const product = await firstValueFrom(dialogRef.afterClosed());
    if (!product) return;

    // buildItemFromProduct debería garantizar qty >= 1,
    // pero normalizamos por si acaso:
    const newItem = this.orderItemService.buildItemFromProduct(
      product,
      this.state().items.length
    );
    const normalizedNewItem = {
      ...newItem,
      qty: Number(newItem.qty ?? 1),
      price: Number(newItem.price ?? 0),
    };

    this.state.update((s) => ({
      ...s,
      items: this.orderItemService.addItem(
        s.items,
        normalizedNewItem,
        s.status
      ),
    }));
  }

  // ---------------------------
  // 🟩 Remover Item
  // ---------------------------
  async removeItem(index: number) {
    const confirmed = await firstValueFrom(
      this.dialog.confirmDialog({
        title: 'Quitar item del pedido',
        message: '¿Deseas quitar el item del pedido?',
        type: 'question',
      })
    );

    if (!confirmed) return;

    this.state.update((s) => ({
      ...s,
      items: this.orderItemService.removeItem(s.items, index),
    }));
  }

  // ---------------------------
  // 🟩 Crear Orden (validaciones + protección)
  // ---------------------------
  async createOrder(): Promise<boolean> {
    const { items, notes, restaurantId, tableId, tableNumber } = this.state();

    // Validar que haya items
    if (!Array.isArray(items) || items.length === 0) {
      await firstValueFrom(
        this.dialog.confirmDialog({
          title: 'Pedido vacío',
          message: 'No se puede crear un pedido sin productos.',
          type: 'error',
        })
      );
      return false;
    }

    // Validar cantidades
    const invalidQty = items.some(
      (it) => !Number.isFinite(Number(it.qty)) || Number(it.qty) < 1
    );
    if (invalidQty) {
      await firstValueFrom(
        this.dialog.confirmDialog({
          title: 'Cantidad inválida',
          message: 'Todos los items deben tener cantidad mayor o igual a 1.',
          type: 'error',
        })
      );
      return false;
    }

    const confirmed = await firstValueFrom(
      this.dialog.confirmDialog({
        title: 'Crear pedido',
        message: '¿Deseas crear este pedido?',
        type: 'question',
      })
    );

    if (!confirmed) return false;

    this.setLoading(true);

    try {
      const waiter = this.auth.getUserID() ?? 'unknown';

      await this.orderService.createOrder({
        items,
        notes,
        restaurantId,
        tableId,
        tableNumber,
        waiter,
        createdBy: waiter,
      });

      return true;
    } finally {
      this.setLoading(false);
    }
  }

  // ---------------------------
  // 🟩 Actualizar Orden (comparo canónica para evitar escrituras)
  // ---------------------------
  async updateOrder(): Promise<boolean> {
    const {
      items,
      notes,
      originalItems,
      originalNotes,
      restaurantId,
      orderId,
    } = this.state();

    const itemsChanged = !this.itemsEqual(items ?? [], originalItems ?? []);
    const notesChanged = (notes ?? '') !== (originalNotes ?? '');

    if (!itemsChanged && !notesChanged) {
      await firstValueFrom(
        this.dialog.confirmDialog({
          title: 'Sin cambios',
          message: 'No se detectaron cambios en la orden.',
          type: 'info',
        })
      );
      return false;
    }

    const confirmed = await firstValueFrom(
      this.dialog.confirmDialog({
        title: 'Actualizar pedido',
        message: '¿Deseas actualizar esta orden?',
        type: 'question',
      })
    );

    if (!confirmed) return false;

    this.setLoading(true);
    try {
      await this.orderService.updateOrder({
        restaurantId,
        orderId,
        items,
        notes,
      });

      // Actualizamos originalItems/notes para reflejar el nuevo estado
      this.state.update((s) => ({
        ...s,
        originalItems: structuredClone(items ?? []),
        originalNotes: notes ?? '',
      }));

      return true;
    } finally {
      this.setLoading(false);
    }
  }

  // ---------------------------
  // 🟩 Cerrar Orden (pago)
  // ---------------------------
  async closeOrder(): Promise<boolean> {
    const state = this.state();

    const confirmed = await firstValueFrom(
      this.dialog.confirmDialog({
        title: 'Cerrar pedido',
        message: '¿Deseas cerrar este pedido y continuar con el pago?',
        type: 'question',
      })
    );

    if (!confirmed) return false;

    const dialogRef = this.matDialog.open(PaymentMethodDialogComponent, {
      data: { orderTotal: this.getTotal() },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!result) return false;

    this.setLoading(true);
    try {
      await this.orderService.closeOrder({
        orderId: state.orderId,
        restaurantId: state.restaurantId,
        tableId: state.tableId,
        paymentMethod: result.method,
      });

      return true;
    } finally {
      this.setLoading(false);
    }
  }

  // ---------------------------
  // 🟩 Cancelar Orden
  // ---------------------------
  async cancelOrder(): Promise<boolean> {
    const state = this.state();

    const confirmed = await firstValueFrom(
      this.dialog.confirmDialog({
        title: 'Cancelar pedido',
        message: '¿Estás seguro de querer cancelar este pedido?',
        type: 'question',
      })
    );

    if (!confirmed) return false;

    this.setLoading(true);
    try {
      await this.orderService.cancelOrder({
        orderId: state.orderId,
        restaurantId: state.restaurantId,
        tableId: state.tableId,
        userId: this.auth.getUserID(),
      });

      return true;
    } finally {
      this.setLoading(false);
    }
  }

  // ---------------------------
  // 🟦 Helpers
  // ---------------------------
  getTotal() {
    return this.orderItemService.getTotal(this.state().items);
  }

  setLoading(v: boolean) {
    this.state.update((s) => ({ ...s, loading: v }));
  }

  // ---------------------------
  // 🟦 Comparación canónica de items para evitar escrituras innecesarias
  // ---------------------------
  private canonicalItem(i: any) {
    // Tomamos solo los campos relevantes para la comparación
    const productId = i.productId ?? i.id ?? null;
    const qty = Number(i.qty ?? 0);
    const price = Number(i.price ?? 0);

    // Normalizar modificadores/opciones si existen (ejemplo genérico)
    const modifiers = (i.modifiers ?? []).map((m: any) => ({
      id: m.id ?? m.modifierId ?? null,
      qty: Number(m.qty ?? m.qty ?? 1),
      // podés agregar más campos si son relevantes para la comparación
    }));

    // ordenar para garantizar canonicidad
    modifiers.sort((a: any, b: any) =>
      a.id > b.id ? 1 : a.id < b.id ? -1 : 0
    );

    return { productId, qty, price, modifiers };
  }

  private itemsEqual(a: any[], b: any[]) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;

    const canonA = a
      .map((x) => this.canonicalItem(x))
      .sort((x: any, y: any) =>
        (x.productId ?? '')
          .toString()
          .localeCompare((y.productId ?? '').toString())
      );
    const canonB = b
      .map((x) => this.canonicalItem(x))
      .sort((x: any, y: any) =>
        (x.productId ?? '')
          .toString()
          .localeCompare((y.productId ?? '').toString())
      );

    return JSON.stringify(canonA) === JSON.stringify(canonB);
  }
}
