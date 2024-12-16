import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FavoriteService } from '../favorite/favorite.service';
import { Product } from '../product/product.model';
import { FavoriteProduct } from '../favorite/favorite-product.model';
import { CartService } from '../cart/cart.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'], 
    imports: [ReactiveFormsModule, CommonModule, RouterModule],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class ProfileComponent implements OnInit {

    profileForm: FormGroup;
    userId: number = 0;
    favorites: Product[] = [];

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router,
        private favoriteService: FavoriteService,
        private cartService: CartService
    ) {
        this.profileForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.minLength(6)]
        });
    }

    addToFavorites(product: Product): void {
      console.log("Отправка данных на сервер:", product.id, this.userId);
      this.favoriteService.addToFavorites(product, this.userId).subscribe(
        (response) => {
          console.log('Товар добавлен в избранное:', product);
          console.log('Ответ сервера:', response);
          this.loadFavorites(); // Обновляем список избранных товаров
        },
        (error) => {
          if (error.status === 400 && error.error?.error === 'Товар уже в избранном') {
            console.warn('Этот товар уже добавлен в избранное');
            alert('Этот товар уже находится в вашем избранном!');
          } else {
            console.error('Ошибка при добавлении товара в избранное:', error);
          }
        }
      );
    }           

    loadFavorites(): void {
        console.log("Загрузка избранного для userId:", this.userId);
        this.favoriteService.getFavorites(this.userId).subscribe(
            (favoritesData: FavoriteProduct[]) => {
                this.favorites = favoritesData; // Предполагается, что FavoriteProduct содержит ссылку на продукт
                console.log("Избранные товары:", this.favorites); 
            },
            error => {
                console.error("Ошибка при загрузке избранного:", error);
                this.favorites = []; // Очистка списка в случае ошибки
            }
        );
    }

    removeFromFavorites(product: Product): void {
      console.log('Переданный объект товара:', product);
  
      const productId = product.productId || product.id;
  
      if (!productId) {
          console.error('Ошибка: ID товара не передан!');
          return;
      }
  
      this.favoriteService.deleteFavorite(this.userId, productId).subscribe(
          () => {
              console.log(`Товар с ID ${productId} успешно удален из избранного.`);
              this.loadFavorites(); // Обновляем список избранного
          },
          (error) => {
              console.error(`Ошибка при удалении товара с ID ${productId}:`, error);
          }
      );
  }

    ngOnInit(): void {
        const currentUser = this.userService.getSession();
        if (currentUser) {
          this.userId = currentUser.id;
          this.loadUserData();
        } else {
          this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
              this.userId = +id;
              if (isNaN(this.userId)) {
                console.error('Невалидный ID пользователя:', id);
                alert('Невалидный ID пользователя.');
                this.router.navigate(['/user-list']);
                return;
              }
              this.loadUserData();
            }
          });
        }
    }      

    loadUserData(): void {
        this.userService.getUserById(this.userId).subscribe(user => {
          if (user) {
            this.profileForm.patchValue({
              name: user.name,
              email: user.email,
              password: user.password  
            });
            this.loadFavorites(); 
          } else {
            alert('Пользователь не найден.');
          }
        });
    }

    logout(): void {
        this.userService.clearSession();
        this.router.navigate(['/login']);
    }

    saveChanges(field: string): void {
        if (this.profileForm.get(field)?.valid) {
            const updatedData = { [field]: this.profileForm.get(field)?.value };
            this.userService.updateUser(this.userId, updatedData).subscribe(
                () => {
                    console.log(`${field} обновлено успешно`);
                },
                error => {
                    console.error(`Ошибка при обновлении ${field}:`, error);
                }
            );
        } else {
            this.profileForm.get(field)?.markAsTouched();
        }
    }

    updatePassword(): void {
        if (this.profileForm.get('password')?.valid) {
            const newPassword = this.profileForm.get('password')?.value;
            const updatedData = { password: newPassword };
            this.userService.updateUser(this.userId, updatedData).subscribe(
                () => {
                    console.log('Пароль обновлен успешно');
                    this.profileForm.get('password')?.setValue('');
                },
                error => {
                    console.error('Ошибка при обновлении пароля:', error);
                }
            );
        } else {
            this.profileForm.get('password')?.markAsTouched();
        }
    }
    deleteUserProfile(): void {
      if (confirm('Вы уверены, что хотите удалить свой профиль? Это действие удалит все данные (корзину, избранное).')) {
        // Удаляем избранные товары
        this.favoriteService.deleteAllFavorites(this.userId).subscribe(
          () => {
            console.log('Избранные товары удалены');
          },
          error => {
            console.error('Ошибка при удалении избранных товаров:', error);
          }
        );
  
        // Удаляем корзину товаров
        this.cartService.clearCart(this.userId).subscribe(
          () => {
            console.log('Корзина товаров очищена');
          },
          error => {
            console.error('Ошибка при удалении корзины:', error);
          }
        );
  
        // Удаляем пользователя
        this.userService.deleteUser(this.userId).subscribe(
          () => {
            console.log('Профиль пользователя удален');
            this.userService.clearSession();
            this.router.navigate(['/login']);
          },
          error => {
            console.error('Ошибка при удалении профиля:', error);
          }
        );
      }
    }

}
