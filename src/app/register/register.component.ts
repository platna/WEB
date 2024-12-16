import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from './../user.service';
import { HighlightDirectiveModule } from './../highlight.directive.module';
import { PasswordStrengthModule } from './../password-strength.pipe.module';
import { switchMap, of, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, HighlightDirectiveModule, PasswordStrengthModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    });
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      matchingControl.setErrors(control.value !== matchingControl.value ? { mustMatch: true } : null);
    };
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.userService.checkEmailExists(email).pipe(
      map((users: any[]) => users.length > 0),
      catchError(() => of(false))
    );
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const user = this.registerForm.value;
      const email = user.email;

      this.userService.checkServerAvailability().pipe(
        switchMap(() => this.checkEmailExists(email)),
        switchMap((emailExists: boolean) => {
          if (emailExists) {
            this.registerForm.get('email')?.setErrors({ emailExists: true });
            return throwError(() => new Error('Email уже существует')); // Используем throwError
          } else {
            return this.userService.registerUser(user);
          }
        })
      ).subscribe({
        next: () => {
          alert('Вы успешно зарегистрировались!');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          if (err) {
            alert('Ошибка при регистрации: ' + err.message);
          }
        }
      });
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}