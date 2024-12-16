import { Injectable } from '@angular/core';
import { Product } from '../product/product.model';
import { FavoriteProduct } from './favorite-product.model';
import { HttpClient} from '@angular/common/http';
import { Observable,throwError,catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = 'http://localhost:3000/favorites';  // Укажите правильный URL вашего API

  constructor(private http: HttpClient) {}

  addToFavorites(product: Product, userId: number): Observable<any> {
    return this.http.post(this.apiUrl, {
      userId: userId,
      productId: product.id,
    });
  }

  // Удаление товара из избранного
  deleteFavorite(userId: number, productId: number): Observable<any> { // Переименовано для ясности
    return this.http.delete(`${this.apiUrl}`, { //  Изменен URL и добавлен body
      body: { userId, productId } // Передаем userId и productId в теле
    }).pipe(
      catchError(error => {
        console.error('Ошибка при удалении товара из избранного:', error);
        return throwError(() => new Error('Ошибка при удалении товара из избранного.')); //  Используем throwError
      })
    );
  }

  deleteAllFavorites(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(error => {
        console.error('Ошибка при удалении всех избранных товаров:', error);
        return throwError(() => new Error('Ошибка при удалении избранных товаров.'));
      })
    );
  }

  // Получение избранных товаров
  getFavorites(userId: number): Observable<FavoriteProduct[]> {
    return this.http.get<FavoriteProduct[]>(`${this.apiUrl}?userId=${userId}`);
  }
}