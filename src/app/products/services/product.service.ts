import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../model/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private firestore: Firestore) { }

  /* =====================================================
   * GETTERS
   * ===================================================== */

  /** Obtiene todos los productos de un restaurante */
  getAllProducts(restaurantId: string): Observable<Product[]> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/products`
    );
    return collectionData(ref, { idField: 'productId' }) as Observable<
      Product[]
    >;
  }

  /** Obtiene un solo producto por ID */
  getProductById(
    restaurantId: string,
    productId: string
  ): Observable<Product> {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/products/${productId}`
    );
    return docData(ref, { idField: 'productId' }) as Observable<Product>;
  }

  /** Productos disponibles por categoría */
  getAvailableProductsByCategory(
    restaurantId: string,
    category: string
  ): Observable<Product[]> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/products`
    );

    const q = query(
      ref,
      where('category', '==', category),
      where('available', '==', true)
    );

    return collectionData(q, { idField: 'productId' }) as Observable<
      Product[]
    >;
  }

  /** Productos en oferta */
  getOfferProducts(restaurantId: string): Observable<Product[]> {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/products`
    );

    const q = query(
      ref,
      where('available', '==', true),
      where('isOffer', '==', true)
    );

    return collectionData(q, { idField: 'productId' }) as Observable<
      Product[]
    >;
  }

  /* =====================================================
   * CREATE
   * ===================================================== */

  /** Crea un nuevo producto */
  async createProduct(
    data: Partial<Product> & { restaurantId: string }
  ): Promise<{ productId: string }> {
    if (!data.restaurantId) {
      throw new Error('restaurantId es obligatorio para crear un producto');
    }

    const ref = collection(
      this.firestore,
      `restaurants/${data.restaurantId}/products`
    );

    const docRef = await addDoc(ref, {
      ...data,
      available: data.available ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { productId: docRef.id };
  }

  /* =====================================================
   * UPDATE
   * ===================================================== */

  /** Edita un producto */
  async updateProduct(
    restaurantId: string,
    productId: string,
    data: Partial<Product>
  ): Promise<void> {
    return (async () => {
      const ref = doc(
        this.firestore,
        `restaurants/${restaurantId}/products/${productId}`
      );

      await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    })();

  }

  /** Activa / Desactiva un producto (evita duplicación) */
  async setProductAvailable(
    restaurantId: string,
    productId: string,
    available: boolean
  ) {
    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/products/${productId}`
    );

    await updateDoc(ref, {
      available,
      updatedAt: serverTimestamp(),
    });
  }

  /** Atajos */
  disableProduct(restaurantId: string, productId: string) {
    return this.setProductAvailable(restaurantId, productId, false);
  }

  enableProduct(restaurantId: string, productId: string) {
    return this.setProductAvailable(restaurantId, productId, true);
  }
}
