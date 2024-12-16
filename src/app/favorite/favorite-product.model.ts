import { Product } from '../product/product.model';

// Интерфейс для описания товара с привязкой к пользователю
export interface FavoriteProduct extends Product {
  userId: number;
}