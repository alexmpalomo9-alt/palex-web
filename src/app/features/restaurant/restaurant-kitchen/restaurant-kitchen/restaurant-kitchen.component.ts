import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { SharedModule } from '../../../../shared/shared.module';
import { KitchenFacade, KitchenOrder } from '../facade/kitchen-facade.service';
import { Restaurant } from '../../model/restaurant.model';
import { RestaurantService } from '../../services/restaurant.service';
import { OrderStatusService } from '../../../order/status/order-status/order-status.service';
import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';

@Component({
  selector: 'app-restaurant-kitchen',
  templateUrl: './restaurant-kitchen.component.html',
  styleUrls: ['./restaurant-kitchen.component.scss'],
  standalone: true,
  imports: [SharedModule, AddButtonComponent],
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
    private restaurantService: RestaurantService,
    private orderStatusService: OrderStatusService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.parent?.paramMap.get('restaurantId');
    if (!slug) {
      console.error('No se encontró restaurantId en la URL');
      return;
    }

    this.restaurantService.getRestaurantBySlug(slug).subscribe((restaurant) => {
      if (!restaurant) return;

      this.restaurant = restaurant;
      this.restaurantId = restaurant.restaurantId!;

      this.activeOrders$ = this.kitchenFacade.getActiveOrders(this.restaurantId);

      let isFirstLoad = true;
      this.subscription = this.activeOrders$.subscribe((orders) => {
        const currentOrderIds = new Set(orders.map((o) => o.orderId));
        if (!isFirstLoad) {
          orders.forEach((order) => {
            if (!this.previousOrderIds.has(order.orderId)) {
              this.playNewOrderSound();
            }
          });
        } else isFirstLoad = false;
        this.previousOrderIds = currentOrderIds;
      });
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /* ===================================================== */
  getStatusLabel(order: KitchenOrder): string | null {
    return this.orderStatusService.getKitchenLabel(order.status);
  }

  getStatusColor(order: KitchenOrder): string {
    return this.orderStatusService.getColor(order.status);
  }

  isPreparingDisabled(order: KitchenOrder): boolean {
    return order.status === 'preparing' || order.status === 'ready';
  }

  isReadyDisabled(order: KitchenOrder): boolean {
    return order.status === 'ready';
  }

  markPreparing(order: KitchenOrder) {
    if (this.isPreparingDisabled(order)) return;
    this.kitchenFacade.markPreparing(this.restaurantId, order.orderId, null);
  }

  markReady(order: KitchenOrder) {
    if (this.isReadyDisabled(order)) return;
    this.kitchenFacade.markReady(this.restaurantId, order.orderId, null);
  }

  acceptUpdate(order: KitchenOrder) {
    if (!this.restaurantId || !order.pendingUpdate) return;
    this.kitchenFacade.acceptUpdate(this.restaurantId, order, null);
  }

  rejectUpdate(order: KitchenOrder) {
    if (!this.restaurantId || !order.pendingUpdate) return;
    this.kitchenFacade.rejectUpdate(this.restaurantId, order, null);
  }

getEffectiveStatus(order: KitchenOrder): string {
  // Si la actualización fue aceptada, seguimos mostrando el estado actual
  // (no usamos pendingUpdate.status porque no existe)
  return this.orderStatusService.getKitchenLabel(order.status) || 'En preparación';
}

  private playNewOrderSound() {
    const audio = new Audio('/assets/sounds/new-order.wav');
    audio.play().catch((err) => console.warn('Error al reproducir sonido', err));
  }
}
