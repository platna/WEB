import { NgModule } from '@angular/core';
import { HighlightDirective } from './highlight.directive';

@NgModule({
  declarations: [HighlightDirective], // Регистрация директивы
  exports: [HighlightDirective] // Экспортируем директиву, чтобы её можно было использовать в других компонентах
})
export class HighlightDirectiveModule {}
