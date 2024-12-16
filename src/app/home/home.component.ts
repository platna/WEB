import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../product/product.service'; // Импортируйте сервис
import { Product } from '../product/product.model'; // Импортируйте модель Product
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class HomeComponent implements OnInit {
  categories = [
    { title: 'Витамины и добавки', image: 'images/Vitamins_Supplements.jpg' },
    { title: 'Облегчение боли', image: 'images/obleghchenie_boli.jpg' },
    { title: 'Сироп от простуды и гриппа', image: 'images/kashel-u-doroslyh-scaled.jpg' },
    { title: 'Первая помощь', image: 'images/First_aid.jpg' },
    { title: 'Здоровье пищеварительной системы', image: 'images/Digestive_health.jpg' },
    { title: 'Уход за ушами', image: 'images/ears.jpg' },
    { title: 'Уход за глазами', image: 'images/8ebcyltl9r83rcwyweuic0lejauagtck.jpg' },
    { title: 'Уход за ногами', image: 'images/towfiqu-barbhuiya-uoyv29mn9am-unsplash.jpg' },
    { title: 'Уход за полостью рта', image: 'images/rot.jpg' },
    { title: 'Средства для сна и борьбы с храпом', image: 'images/BLOG_HRAP.jpg' },
    { title: 'Отказ от курения', image: 'images/kurenie.jpg' },
    { title: 'Спортивное питание', image: 'images/sport_pitanie.jpg' },
    { title: 'Здоровое питание', image: 'images/zdororovoe_pitanie.jpg' },
    { title: 'Мама и малыш', image: 'images/mama_i_malysh.jpg' },
  ];

  productsByCategory: { [key: string]: Product[] } = {};
  searchQuery: string = '';  // Для хранения введенного запроса

  constructor(private router: Router, private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe((products) => {
      this.categories.forEach((category) => {
        this.productsByCategory[category.title] = products.filter(
          (product) => product.category === category.title
        );
      });
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Фильтрация товаров по имени
      const product = this.findProductByName(this.searchQuery.trim());
      if (product) {
        this.router.navigate([`/product/${product.id}`]);
      } else {
        alert('Товар не найден');
      }
    }
  }

  findProductByName(query: string): Product | undefined {
    // Поиск товара по имени среди всех товаров
    for (const category in this.productsByCategory) {
      const product = this.productsByCategory[category].find(
        (prod) => prod.name.toLowerCase().includes(query.toLowerCase())
      );
      if (product) {
        return product;
      }
    }
    return undefined;  // Если товар не найден
  }

  goToProductDetail(productId: string): void {
    this.router.navigate([`/product/${Number(productId)}`]);  // Преобразуем id в number
  }
}
