import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, forkJoin, map } from 'rxjs';
import { Product } from '../../../../products/model/product.model';
import { ProductService } from '../../../../products/services/product.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private productService: ProductService) {}

  /** =========================
   * Obtener menú completo de un restaurante
   * Incluye: productos disponibles por categoría y ofertas
   * ========================= */
  async getMenuByRestaurant(restaurantId: string): Promise<Product[]> {
    // Categorías principales
    const categories = ['all', 'offers']; // puedes agregar más según necesidad

    // Crear observables según categoría
    const observables: Observable<Product[]>[] = categories.map(cat => {
      if (cat === 'offers') {
        return this.productService.getOfferProducts(restaurantId);
      } else {
        return this.productService.getAvailableProductsByCategory(restaurantId, cat);
      }
    });

    // Ejecutar todas las consultas en paralelo y combinar resultados
    const results = await firstValueFrom(
      forkJoin(observables).pipe(
        map(arrays => arrays.flat()) // unimos todos los productos en un solo array
      )
    );

    return results;
  }

  /** =========================
   * Obtener menú filtrado por categoría
   * ========================= */
  getMenuByCategory(restaurantId: string, category: string): Observable<Product[]> {
    if (category.toLowerCase() === 'offers') {
      return this.productService.getOfferProducts(restaurantId);
    } else {
      return this.productService.getAvailableProductsByCategory(restaurantId, category);
    }
  }
}
