import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, where } from '@angular/fire/firestore';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../../../products/model/product.model';
import { RestaurantStats } from '../restaurant-stats/model/restaurant-stats';

@Injectable({
  providedIn: 'root'
})
export class RestaurantStatsServiceService {

  constructor(private firestore: Firestore) {}

  // Obtener productos del restaurante
  getProductsByRestaurant(restaurantId: string): Observable<Product[]> {
    const ref = collection(this.firestore, `restaurants/${restaurantId}/products`);
    return collectionData(ref, { idField: 'productId' }) as Observable<Product[]>;
  }

  // Obtener comentarios del restaurante
  getCommentsByRestaurant(restaurantId: string): Observable<Comment[]> {
    const ref = collection(this.firestore, `restaurants/${restaurantId}/comments`);
    return collectionData(ref, { idField: 'commentId' }) as Observable<Comment[]>;
  }

  // Obtener rating promedio (puede estar en doc principal del restaurante)
  getAverageRating(restaurantId: string): Observable<number> {
    const ref = doc(this.firestore, `restaurants/${restaurantId}`);
    return docData(ref).pipe(
      map((rest: any) => rest?.rating || 0)
    );
  }

  // Vistas del mes (puede ser un campo en el doc principal o en subcolección)
  getMonthlyViews(restaurantId: string): Observable<number> {
    const ref = doc(this.firestore, `restaurants/${restaurantId}`);
    return docData(ref).pipe(
      map((rest: any) => rest?.monthlyViews || 0)
    );
  }

  // Función que combina todo en un solo observable
getStats(restaurantId: string): Observable<RestaurantStats> {
  return forkJoin({
    totalMenuItems: this.getProductsByRestaurant(restaurantId).pipe(map(p => p.length)),
    totalComments: this.getCommentsByRestaurant(restaurantId).pipe(map(c => c.length)),
    rating: this.getAverageRating(restaurantId),
    monthlyViews: this.getMonthlyViews(restaurantId)
  });
}
}
