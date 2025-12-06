import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Restaurant } from '../model/restaurant.model';
import { Product } from '../../../products/model/product.model';

/**
 * Ejecuta una función async dentro de un contexto de inyección activo
 */
async function runAsyncInInjectionContext<T>(
  injector: Injector,
  fn: () => Promise<T>
): Promise<T> {
  return await runInInjectionContext(injector, () => {
    return new Promise((resolve, reject) => {
      fn().then(resolve).catch(reject);
    });
  });
}

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private firestore: Firestore = inject(Firestore);
  private injector: Injector = inject(Injector);

  constructor() {}

  /* =========================================================
     SLUG HELPERS
  ========================================================= */
  private generateSlugBase(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(name: string, ignoreId?: string): Promise<string> {
    return runAsyncInInjectionContext(this.injector, async () => {
      const base = this.generateSlugBase(name);
      const q = query(collection(this.firestore, 'restaurants'), where('slug', '>=', base));

      const snapshot = await getDocs(q);
      const slugs = snapshot.docs
        .filter((d) => d.id !== ignoreId)
        .map((d) => d.data()['slug']);

      if (!slugs.includes(base)) return base;

      let count = 1;
      let newSlug = `${base}-${count}`;
      while (slugs.includes(newSlug)) {
        count++;
        newSlug = `${base}-${count}`;
      }
      return newSlug;
    });
  }

  /* =========================================================
     CREATE
  ========================================================= */
async createRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
  return runAsyncInInjectionContext(this.injector, async () => {
    const slug = await this.generateUniqueSlug(data.name!);

    // 1️⃣ Crear el restaurante
    const ref = await addDoc(collection(this.firestore, 'restaurants'), {
      ...data,
      slug,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const restaurant = {
      ...data,
      restaurantId: ref.id,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as Restaurant;

    // 2️⃣ Crear categorías por defecto
    await this.createDefaultCategories(ref.id);

    return restaurant;
  });
}

  /* =========================================================
     READ
  ========================================================= */
getRestaurantBySlug(slug: string): Observable<Restaurant | null> {
  const q = query(
    collection(this.firestore, 'restaurants'),
    where('slug', '==', slug)
  );

  return collectionData(q, { idField: 'restaurantId' }).pipe(
    map((rests: any[]) => rests.length ? rests[0] : null)
  );
}
  getRestaurantsByStatus(enabled: boolean): Observable<Restaurant[]> {
    const q = query(collection(this.firestore, 'restaurants'), where('enabled', '==', enabled));
    return collectionData(q, { idField: 'restaurantId' }) as Observable<Restaurant[]>;
  }
  
 
  /* =========================================================
     UPDATE
  ========================================================= */
  async updateRestaurantData(restaurantId: string, updated: Partial<Restaurant>): Promise<void> {
    return runAsyncInInjectionContext(this.injector, async () => {
      const ref = doc(this.firestore, `restaurants/${restaurantId}`);
      const payload: any = { ...updated, updatedAt: serverTimestamp() };

      if (updated.name) {
        payload.slug = await this.generateUniqueSlug(updated.name, restaurantId);
      }

      await updateDoc(ref, payload);
    });
  }

  /* =========================================================
     PRODUCTS
  ========================================================= */
  getProductsByRestaurant(restaurantId?: string): Observable<Product[]> {
    if (!restaurantId) return new Observable((sub) => sub.next([]));

    const ref = collection(this.firestore, `restaurants/${restaurantId}/products`);
    return collectionData(ref, { idField: 'productId' }) as Observable<Product[]>;
  }

  /* =========================================================
     ENABLE / DISABLE
  ========================================================= */
  async disableRestaurant(restaurantId: string): Promise<void> {
    return runAsyncInInjectionContext(this.injector, async () => {
      await updateDoc(doc(this.firestore, `restaurants/${restaurantId}`), {
        enabled: false,
        updatedAt: new Date().toISOString(),
      });
    });
  }

  async enableRestaurant(restaurantId: string): Promise<void> {
    return runAsyncInInjectionContext(this.injector, async () => {
      await updateDoc(doc(this.firestore, `restaurants/${restaurantId}`), {
        enabled: true,
        updatedAt: new Date().toISOString(),
      });
    });
  }

  /* =========================================================
     CATEGORIAS POR DEFECTO AL CREAR UN RESTAURANTE
  ========================================================= */

  async createDefaultCategories(restaurantId: string) {
  const defaults = [
    { name: "ENTRADAS", order: 1 },
    { name: "PRINCIPAL", order: 2 },
    { name: "BEBIDAS", order: 3 },
    { name: "POSTRES", order: 4 },
  ];

  for (const c of defaults) {
    await addDoc(
      collection(this.firestore, `restaurants/${restaurantId}/categories`),
      {
        ...c,
        restaurantId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    );
  }
}

}
