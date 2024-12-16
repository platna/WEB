import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from './product.service';
import { Product } from './product.model';
import { CartService } from '../cart/cart.service'; // Импортируем сервис
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoriteService } from '../favorite/favorite.service'; // Импорт сервиса
import { UserService } from '../user.service'; // Импортируем UserService

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css'],
    imports: [CommonModule, RouterModule],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  userId: number | undefined;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private userService: UserService // Внедряем UserService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    console.log('ID продукта из маршрута:', id);
  
    // Проверяем данные в localStorage
    const currentUser = this.userService.getSession();
    console.log('Данные из localStorage при загрузке страницы:', currentUser);
  
    if (currentUser) {
      this.userId = currentUser.id;
      console.log('Авторизованный пользователь:', currentUser);
    } else {
      console.error('Пользователь не авторизован');
    }
  
    // Загружаем продукт
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        console.log('Загруженный продукт:', this.product);
      },
      error: (err) => {
        console.error('Ошибка при загрузке продукта:', err);
      }
    });
  }

  addToCart(product: Product | undefined): void {
    if (product) {
      this.cartService.addToCart(product);
      console.log('Товар добавлен в корзину:', product);
    } else {
      console.log('Товар не найден');
    }
  }

  // Добавить в избранное
  addToFavorites(product: Product | undefined): void {
    if (product && this.userId) {
      console.log('Отправка запроса на добавление в избранное:', product);
      this.favoriteService.addToFavorites(product, this.userId).subscribe({
        next: (response) => {
          console.log('Товар успешно добавлен в избранное:', response);
        },
        error: (err) => {
          console.error('Ошибка при добавлении в избранное:', err);
        }
      });
    } else {
      console.log('Товар или userId не найдены');
    }
  }  
}
