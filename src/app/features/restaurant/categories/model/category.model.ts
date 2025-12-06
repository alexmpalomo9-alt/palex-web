export interface Category {
  categoryId: string;
  restaurantId: string;
  name: string;
  order: number;
  icon?: string;   // nombre de icono (Material icon) o URL
  color?: string;  // opcional: hex
  createdAt?: any;
  updatedAt?: any;
}
