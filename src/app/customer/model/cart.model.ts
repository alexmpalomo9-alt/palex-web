import { Product } from '../../products/model/product.model';

export interface CartItem extends Product {
  quantity: number; // cantidad de este producto en el carrito
}
