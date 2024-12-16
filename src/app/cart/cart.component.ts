import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CartService } from './cart.service';
import { Product } from '../product/product.model';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css'],
    imports: [CommonModule, RouterModule,],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class CartComponent implements OnInit {
  cartItems: Product[] = [];

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const currentUser = this.userService.getSession();
    if (!currentUser) {
      this.snackBar.open('Вы не авторизованы.', 'Закрыть', {
        duration: 3000
      });
      this.router.navigate(['/login']);
    } else {
      this.cartService.getCartItems(currentUser.id); // Загружаем корзину при инициализации
      this.cartService.cartItems$.subscribe((cartItems) => {
        this.cartItems = cartItems; // Подписываемся на изменения
      });
    }
  }

  // Увеличить количество
increaseQuantity(cartItem: Product): void {
  this.cartService.increaseQuantity(cartItem);
}

// Уменьшить количество
decreaseQuantity(cartItem: Product): void {
  this.cartService.decreaseQuantity(cartItem);
}

// Добавить в корзину
addProductToCart(product: Product): void {
  this.cartService.addToCart(product);
}

  // Получить общую сумму
  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  // Очистить корзину
  clearCart(): void {
    const currentUser = this.userService.getSession();
    if (currentUser) {
      this.cartService.clearCart(currentUser.id);
      this.cartItems = [];  // Очистить локальный список корзины
    }
  }
}