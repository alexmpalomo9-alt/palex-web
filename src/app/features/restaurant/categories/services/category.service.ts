import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Category } from '../model/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private firestore: Firestore) {}

  private categoriesCollectionRef(restaurantId: string) {
    return collection(this.firestore, `restaurants/${restaurantId}/categories`);
  }

  private productsCollectionRef(restaurantId: string) {
    return collection(this.firestore, `restaurants/${restaurantId}/products`);
  }

  // ------------------------------------------------------------
  // Listado
  // ------------------------------------------------------------
  getCategories(restaurantId: string): Observable<Category[]> {
    const ref = this.categoriesCollectionRef(restaurantId);
    const q = query(ref, orderBy('order', 'asc'));
    return collectionData(q, { idField: 'categoryId' }) as Observable<
      Category[]
    >;
  }

  // ------------------------------------------------------------
  // Validación de duplicados
  // ------------------------------------------------------------
  async existsCategoryName(
    restaurantId: string,
    name: string
  ): Promise<boolean> {
    const ref = this.categoriesCollectionRef(restaurantId);
    const q = query(ref, where('name', '==', name.trim().toUpperCase()));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  // ------------------------------------------------------------
  // Crear categoría con validación + auto-orden
  // ------------------------------------------------------------
  async createCategory(data: Partial<Category> & { restaurantId: string }) {
    const normalizedName = data.name!.trim().toUpperCase();

    // ❗ validar duplicado
    if (await this.existsCategoryName(data.restaurantId, normalizedName)) {
      throw new Error('Ya existe una categoría con ese nombre.');
    }

    const ref = this.categoriesCollectionRef(data.restaurantId);
    const q = query(ref, orderBy('order', 'desc'));
    const snap = await getDocs(q);

    const maxOrder = snap.empty ? 0 : (snap.docs[0].data() as any).order ?? 0;
    const newOrder = maxOrder + 1;

    const docRef = await addDoc(ref, {
      name: normalizedName,
      order: newOrder,
      icon: data.icon ?? null,
      color: data.color ?? null,
      restaurantId: data.restaurantId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { categoryId: docRef.id };
  }

  // ------------------------------------------------------------
  // Editar con validación de duplicado
  // ------------------------------------------------------------
  async updateCategory(
    restaurantId: string,
    categoryId: string,
    data: Partial<Category>
  ) {
    const normalizedName = data.name?.trim().toUpperCase();

    if (normalizedName) {
      // buscar colisión en nombre
      const ref = this.categoriesCollectionRef(restaurantId);
      const q = query(ref, where('name', '==', normalizedName));
      const snap = await getDocs(q);

      const duplicate = snap.docs.find((d) => d.id !== categoryId);
      if (duplicate) {
        throw new Error('Ya existe otra categoría con ese nombre.');
      }
    }

    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/categories/${categoryId}`
    );
    await updateDoc(ref, {
      ...data,
      name: normalizedName ?? data.name,
      updatedAt: serverTimestamp(),
    });
  }

  // ------------------------------------------------------------
  // Reordenamiento
  // ------------------------------------------------------------
  async reorderCategories(restaurantId: string, orderedIds: string[]) {
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      const ref = doc(
        this.firestore,
        `restaurants/${restaurantId}/categories/${id}`
      );
      await updateDoc(ref, {
        order: i,
        updatedAt: serverTimestamp(),
      });
    }
  }

  /** Evitar duplicados al editar */
  async existsCategoryNameExcludingId(
    restaurantId: string,
    name: string,
    excludeId: string
  ): Promise<boolean> {
    const ref = this.categoriesCollectionRef(restaurantId);
    const q = query(ref, where('name', '==', name));
    const snap = await getDocs(q);

    return snap.docs.some((doc) => doc.id !== excludeId);
  }

  /** Reasigna productos a "Sin categoría" */
  async reassignProductsToDefault(restaurantId: string, categoryId: string) {
    const productsRef = collection(
      this.firestore,
      `restaurants/${restaurantId}/products`
    );

    const q = query(productsRef, where('categoryId', '==', categoryId));
    const snap = await getDocs(q);

    for (const docItem of snap.docs) {
      await updateDoc(docItem.ref, {
        categoryId: 'uncategorized',
        updatedAt: serverTimestamp(),
      });
    }
  }

  /** Borrar categoría → reasigna productos y luego borra */
  async deleteCategory(restaurantId: string, categoryId: string) {
    await this.reassignProductsToDefault(restaurantId, categoryId);

    const ref = doc(
      this.firestore,
      `restaurants/${restaurantId}/categories/${categoryId}`
    );
    await deleteDoc(ref);
  }

  getProductsByCategory(restaurantId: string, categoryId: string) {
    const ref = collection(
      this.firestore,
      `restaurants/${restaurantId}/products`
    );

    const q = query(
      ref,
      where('categoryId', '==', categoryId),
      orderBy('name', 'asc')
    );

    return collectionData(q, { idField: 'productId' });
  }
}
