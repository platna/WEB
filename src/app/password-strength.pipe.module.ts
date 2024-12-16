import { NgModule } from '@angular/core';
import { PasswordStrengthPipe } from './password-strength.pipe';

@NgModule({
  declarations: [PasswordStrengthPipe],
  exports: [PasswordStrengthPipe] // Экспортируем пайп, чтобы его можно было использовать в других компонентах
})
export class PasswordStrengthModule {}
