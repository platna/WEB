import { Injectable } from '@angular/core';
import { Product } from '../product/product.model';
import { UserService } from '../user.service';
import { HttpClient } from '@angular/common/http';
import { Observable,BehaviorSubject,throwError,catchError } from 'rxjs';  // Добавлен импорт Observable и of

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/cart';
  private cartItemsSubject = new BehaviorSubject<Product[]>([]);
  cartItems$: Observable<Product[]> = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient, private userService: UserService) {}

  // Получаем товары из корзины
  getCartItems(userId: number): void {
    this.http.get<Product[]>(`${this.apiUrl}/${userId}`)
      .subscribe((cartItems) => this.cartItemsSubject.next(cartItems));
  }

  // Добавляем товар
  addToCart(product: Product): void {
    const userId = this.userService.getSession()?.id;
    if (userId) {
      this.http.post<Product[]>(`${this.apiUrl}/${userId}`, { productId: product.id, quantity: 1 })
        .subscribe(() => this.getCartItems(userId)); // Обновляем корзину после добавления
    }
  }

  // Увеличиваем количество
  increaseQuantity(cartItem: Product): void {
    const userId = this.userService.getSession()?.id;
    if (userId) {
      this.http.put<Product[]>(`${this.apiUrl}/${userId}`, { productId: cartItem.productId, quantity: cartItem.quantity + 1 })
        .subscribe(() => this.getCartItems(userId)); // Обновляем корзину
    }
  }

  
  // Уменьшаем количество
  decreaseQuantity(cartItem: Product): void {
    const userId = this.userService.getSession()?.id;
    if (userId) {
      if (cartItem.quantity - 1 === 0) {
        // Удаляем товар
        this.http.delete(`${this.apiUrl}/${userId}`, { body: { productId: cartItem.productId } })
          .subscribe(() => this.getCartItems(userId)); // Обновляем корзину
      } else {
        // Уменьшаем количество
        this.http.put<Product[]>(`${this.apiUrl}/${userId}`, { productId: cartItem.productId, quantity: cartItem.quantity - 1 })
          .subscribe(() => this.getCartItems(userId)); // Обновляем корзину
      }
    }
  }

  // Сохраняем обновленные товары в корзине (на сервере)
  setCartItems(cartItems: Product[]): void {
    const userId = this.userService.getSession()?.id;
    if (userId) {
      // Отправляем обновленную корзину на сервер
      this.http.put(`${this.apiUrl}/${userId}`, cartItems)
        .subscribe();
    }
  }

  clearCart(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`, { body: { clearAll: true } })
      .pipe(
        catchError((error) => {
          console.error('Ошибка при очистке корзины:', error);
          return throwError(() => new Error('Ошибка при очистке корзины.'));
        })
      );
  }
  
}