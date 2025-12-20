import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { SharedModule } from '../../../../shared/shared.module';
import { KitchenFacade, KitchenOrder } from '../facade/kitchen-facade.service';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';

@Component({
  selector: 'app-restaurant-kitchen',
  templateUrl: './restaurant-kitchen.component.html',
  styleUrls: ['./restaurant-kitchen.component.scss'],
  standalone: true,
  imports: [SharedModule],
})
export class RestaurantKitchenComponent implements OnInit, OnDestroy {
  activeOrders$!: Observable<KitchenOrder[]>;
  restaurantId!: string;
  private previousOrderIds = new Set<string>();
  private subscription!: Subscription;

  @Input() restaurant: Restaurant | null = null;

  constructor(
    private kitchenFacade: KitchenFacade,
    private route: ActivatedRoute,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.parent?.paramMap.get('restaurantId');

    if (!slug) {
      console.error('No se encontró restaurantId en la URL');
      return;
    }

    // Obtener el restaurante primero
    this.restaurantService.getRestaurantBySlug(slug).subscribe((restaurant) => {
      if (!restaurant) return;

      this.restaurant = restaurant;
      this.restaurantId = restaurant.restaurantId!;

      // Suscribirse a los pedidos activos
      this.activeOrders$ = this.kitchenFacade.getActiveOrders(
        this.restaurantId
      );

      this.subscription = this.activeOrders$.subscribe((orders) => {
        const currentOrderIds = new Set(orders.map((o) => o.orderId));

        // Detectar pedidos nuevos
        orders.forEach((order) => {
          if (!this.previousOrderIds.has(order.orderId)) {
            this.playNewOrderSound();
          }
        });

        // Actualizar el set de pedidos anteriores
        this.previousOrderIds = currentOrderIds;
      });
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /* =====================================================
     ⏱️ TIEMPO TRANSCURRIDO (UI)
  ===================================================== */
  getElapsedMinutes(createdAt: any): number {
    if (!createdAt) return 0;
    const created = createdAt.toDate();
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return Math.floor(diffMs / 60000);
  }

  getElapsedLabel(createdAt: any): string {
    const minutes = this.getElapsedMinutes(createdAt);
    if (minutes < 1) return 'Recién llegada';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `Hace ${hours} h`;
  }

  /* =====================================================
     🔔 SONIDO DE NUEVO PEDIDO
  ===================================================== */
  private playNewOrderSound() {
    const audio = new Audio('/assets/sounds/new-order.wav'); // archivo WAV en assets/sounds
    audio
      .play()
      .catch((err) => console.warn('Error al reproducir sonido', err));
  }

  /* =====================================================
     🔹 LABEL Y ESTADO DE PEDIDOS
  ===================================================== */
  getStatusLabel(
    order: KitchenOrder
  ): 'Nuevo' | 'Actualizado' | 'En preparación' | 'Listo' | undefined {
    switch (order.status) {
      case 'approved':
        return 'Nuevo';
      case 'updated':
        return 'Actualizado';
      case 'preparing':
        return 'En preparación';
      case 'ready':
        return 'Listo';
      default:
        return undefined;
    }
  }

  isPreparingDisabled(order: KitchenOrder): boolean {
    return order.status === 'preparing' || order.status === 'ready';
  }

  isReadyDisabled(order: KitchenOrder): boolean {
    return order.status === 'ready';
  }

  /* =====================================================
     🍳 ACCIONES DE COCINA
  ===================================================== */
  markPreparing(order: KitchenOrder) {
    if (order.status === 'preparing' || order.status === 'ready') return;
    this.kitchenFacade.markPreparing(this.restaurantId, order.orderId, null);
  }

  markReady(order: KitchenOrder) {
    if (order.status === 'ready') return;
    this.kitchenFacade.markReady(this.restaurantId, order.orderId, null);
  }
}
