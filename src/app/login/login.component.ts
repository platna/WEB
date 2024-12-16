import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from './../user.service';
import { HighlightDirectiveModule } from './../highlight.directive.module';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, HighlightDirectiveModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
  
      this.userService.checkServerAvailability().subscribe({
        next: () => {
          this.userService.getUsers().subscribe({
            next: (users) => {
              const user = users.find(
                (u: any) => u.email === email && u.password === password
              );
              if (user) {
                alert('Вход выполнен успешно!');
                this.userService.setSession(user);  // Сохраняем сессию
                this.router.navigate(['/profile', user.id]);  // Перенаправляем на страницу профиля
              } else {
                alert('Неправильные почта или пароль!');
              }
            },
            error: () => alert('Ошибка при загрузке пользователей.')
          });
        },
        error: (err) => {
          alert(err.message);  // Сервер недоступен
        }
      });
    }
  }
  
  ngOnInit() {
    const currentUser = this.userService.getSession();
    if (currentUser) {
      alert('Вы уже авторизованы!');
      this.router.navigate(['/profile']);
    }
  }
  
  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
