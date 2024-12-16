import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-edit-user',
    standalone: true,
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.css'],
    imports: [FormsModule, CommonModule, RouterModule]
})
export class EditUserComponent implements OnInit {
  userId: number = 0;
  user: any = { name: '', email: '', password: '', confirmPassword: ''};

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = +id;
      if (isNaN(this.userId)) {
        console.error('Невалидный ID пользователя:', id);
        alert('Невалидный ID пользователя.');
        this.router.navigate(['/user-list']);
        return;
      }

      this.userService.getUserById(this.userId).subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
            this.user.confirmPassword = this.user.password || '';
          } else {
            console.error('Пользователь не найден');
            alert('Пользователь не найден');
            this.router.navigate(['/user-list']);
          }
        },
        error: (err) => {
          console.error('Ошибка при получении пользователя:', err);
          alert('Ошибка при получении пользователя');
          this.router.navigate(['/user-list']);
        }
      });
    } else {
      console.error('Ошибка: ID пользователя не найден в маршруте');
      alert('Ошибка: ID пользователя не найден в маршруте');
      this.router.navigate(['/user-list']);
    }
  }

  onSubmit(form: any) {
    if (form.valid) {
      if (this.user.password !== this.user.confirmPassword) {
        alert('Пароли не совпадают!');
        return;
      }

      this.userService.updateUser(this.userId, this.user).subscribe({
        next: () => {
          alert('Пользователь обновлен!');
          this.router.navigate(['/user-list']);
        },
        error: (err) => {
          console.error('Ошибка при обновлении пользователя:', err);
          alert('Ошибка при обновлении пользователя: ' + err.message);
        }
      });
    }
  }
}