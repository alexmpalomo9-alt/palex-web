import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../auth/services/auth-service/auth.service';
import { OrderItemService } from '../../../order/services/order-item/order-item.service';
import { MatDialog } from '@angular/material/dialog';
import { MenuDialogComponent } from '../../../restaurant/restaurant-menu/menu-dialog/menu-dialog.component';
import { OrderService } from '../../services/order-service/order.service';
import { TableService } from '../../../restaurant/restaurant-tables/services/table.service';
import { DialogService } from '../../../../core/services/dialog-service/dialog.service';
import { OrderStatus } from '../../models/order.model';

export interface OrderDialogState {
  items: any[];
  notes: string;
  status: OrderStatus;
  isEditMode: boolean;

  originalItems: any[];
  originalNotes: string;

  loading: boolean;

  restaurantId: string;

  tableIds: string[]; // IDs reales
  tableNumbers: number[]; // SOLO UI
  currentTable?: number;
  orderId?: string;
}
export type UpdateOrderResult = 'UPDATED' | 'NO_CHANGES' | 'CANCELLED';

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
      tableIds: [], // ✅ array
      tableNumbers: [],
      currentTable: undefined,
      orderId: undefined,
    };
  }

  state = signal<OrderDialogState>(this.initialState());

  // ---------------------------
  // Constructor
  // ---------------------------
  constructor(
    private orderService: OrderService,
    private tableService: TableService,
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
   *   tableIds,
   *   tableNumber,
   *   orderId? ,
   *   forceNew?: boolean
   * }
   */

  initialize(data: {
    restaurantId: string;
    tableIds: string[];
    tableNumbers: number[];
    orderId?: string;
    forceNew?: boolean;
  }) {
    this.resetState();

    this.state.update((s) => ({
      ...s,
      restaurantId: data.restaurantId,
      tableIds: data.tableIds,
      tableNumbers: data.tableNumbers,
      currentTable: data.tableNumbers[0],
      orderId: data.orderId,
    }));

    if (data.orderId) {
      void this.loadOrder();
    }
  }

  // ---------------------------
  // 🟩 Cargar Orden (desde backend) - normaliza cantidades y notas
  // ---------------------------
  async loadOrder() {
    const { restaurantId, orderId } = this.state();
    if (!restaurantId || !orderId) return;

    try {
      const order = await this.orderService.getOrderWithItems(
        restaurantId,
        orderId
      );

      const normalizedItems = (order.items ?? []).map((i: any) => ({
        itemId: i.itemId,
        productId: i.productId,
        name: i.name,
        price: Number(i.price ?? 0),
        qty: Number(i.qty ?? 1),
        subtotal: i.subtotal ?? i.price * i.qty,
        position: i.position,
        notes: i.notes ?? '',
      }));

      this.state.update((s) => ({
        ...s,
        items: normalizedItems,
        notes: order.notes ?? '',
        status: order.status ?? 'draft',
        isEditMode: order.status !== 'draft',

        // Guardar originales para comparación al actualizar
        tableIds: order.tableIds ?? s.tableIds,
        tableNumbers: order.tableNumbers ?? s.tableNumbers,

        originalItems: structuredClone(normalizedItems),
        originalNotes: order.notes ?? '',
      }));
    } catch (error: any) {
      this.dialog.errorDialog('Error al cargar pedido', error.message);
    }
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

    const products = await firstValueFrom(dialogRef.afterClosed());

    if (!Array.isArray(products) || !products.length) return;

    this.state.update((s) => {
      let updatedItems = [...s.items];

      products.forEach(({ product, qty }) => {
        const newItem = this.orderItemService.buildItemFromProduct(
          product,
          updatedItems.length
        );

        updatedItems = this.orderItemService.addItem(
          updatedItems,
          {
            ...newItem,
            qty,
          },
          s.status
        );
      });

      return {
        ...s,
        items: updatedItems,
      };
    });
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
  // 🟩 Crear Orden
  // ---------------------------
  async createOrder(): Promise<boolean> {
    const { items, notes, restaurantId, tableIds, tableNumbers } = this.state();

    if (!(await this.validateItems(items))) return false;

    const confirmed = await firstValueFrom(
      this.dialog.confirmDialog({
        title: 'Crear pedido',
        message: `¿Deseas crear este pedido para las mesas ${tableNumbers.join(
          ', '
        )}?`,
        type: 'question',
      })
    );

    if (!confirmed) return false;

    this.setLoading(true);

    try {
      // 🔹 Snapshot del usuario (SIN LECTURAS)
      const user = this.auth.getUserSnapshot();

      await this.orderService.createOrderForMozo(restaurantId, {
        tableIds,

        waiterId: user.uid,
        waiterName: user.name,
        waiterRole: user.role,

        createdBy: user.uid,
        notes,
        items,
      });

      // 🚫 NO volver a tocar mesas aquí

      return true;
    } catch (error: any) {
      this.dialog.errorDialog('Error', error.message);
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  // ---------------------------
  // 🟩 Actualizar Orden (comparo canónica para evitar escrituras)
  // ---------------------------
  async updateOrder(): Promise<UpdateOrderResult> {
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

    // Pedido vacío → ya maneja su propio dialog de error
    if (!(await this.validateItems(items))) {
      return 'CANCELLED';
    }

    // 🟡 Sin cambios → solo informamos el resultado
    if (!itemsChanged && !notesChanged) {
      return 'NO_CHANGES';
    }

    const confirmed = await firstValueFrom(
      this.dialog.confirmDialog({
        title: 'Actualizar pedido',
        message: '¿Deseas actualizar esta orden?',
        type: 'question',
      })
    );

    if (!confirmed) return 'CANCELLED';

    this.setLoading(true);

    try {
      await this.orderService.updateOrder(
        restaurantId!,
        orderId!,
        items,
        notes,
        this.requireUserId()
      );

      this.state.update((s) => ({
        ...s,
        originalItems: structuredClone(items ?? []),
        originalNotes: notes ?? '',
      }));

      return 'UPDATED';
    } finally {
      this.setLoading(false);
    }
  }

  private async validateItems(items: any[]): Promise<boolean> {
    if (!items.length) {
      await firstValueFrom(
        this.dialog.confirmDialog({
          title: 'Pedido vacío',
          message: 'No se puede guardar un pedido sin productos.',
          type: 'error',
        })
      );
      return false;
    }
    return true;
  }

  // ---------------------------
  // 🟩 Cerrar Orden (pago)
  // ---------------------------
  async closeOrder(payment: {
    method: string;
    detail?: string;
  }): Promise<boolean> {
    const state = this.state();
    const userId = this.requireUserId();

    try {
      // Pasamos el payment al service
      await this.orderService.closeOrder(
        state.restaurantId,
        state.orderId!,
        userId,
        payment
      );

      // Actualizar estado local para UI
      this.state.update((s) => ({
        ...s,
        status: 'closed',
        tableIds: [],
      }));

      return true;
    } catch (error: any) {
      await firstValueFrom(
        this.dialog.errorDialog('Error al cerrar pedido', error.message)
      );
      return false;
    }
  }

  private requireUserId(): string {
    const userId = this.auth.getUserID();
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    return userId;
  }

  // ---------------------------
  // 🟩 Cancelar Orden
  // ---------------------------
  async cancelOrder(): Promise<boolean> {
    const { restaurantId, orderId, tableIds } = this.state();

    const userId = this.auth.getUserID();
    if (!userId) {
      this.dialog.errorDialog(
        'Sesión inválida',
        'No se pudo identificar el usuario actual.'
      );
      return false;
    }

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
      await this.orderService.cancelOrder(restaurantId, orderId!, userId);

      return true;
    } catch (error: any) {
      this.dialog.errorDialog('Error', error.message);
      return false;
    } finally {
      this.setLoading(false);
    }
  }
  enableEditMode() {
    this.state.update((s) => (s.isEditMode ? s : { ...s, isEditMode: true }));
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

  // ---------------------------
  // 🟩 Marcar pedido como entregado
  // ---------------------------
  async markAsDelivered(): Promise<boolean> {
    const { restaurantId, orderId, status } = this.state();

    if (status !== 'ready') return false;

    const userId = this.requireUserId();

    this.setLoading(true);

    try {
      await this.orderService.updateOrderStatus(
        restaurantId,
        orderId!,
        'delivered',
        userId
      );

      this.state.update((s) => ({
        ...s,
        status: 'delivered',
      }));

      return true;
    } catch (error: any) {
      this.dialog.errorDialog(
        'Error',
        error.message || 'No se pudo marcar como entregado'
      );
      return false;
    } finally {
      this.setLoading(false);
    }
  }
}
