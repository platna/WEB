import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users'; // URL JSON-сервера

  constructor(
    private http: HttpClient) {}

  checkServerAvailability(): Observable<boolean> {
    return this.http.get('http://localhost:3000/users', { responseType: 'text' }).pipe(
      map(() => true), // Если сервер ответил, возвращаем true
      catchError(() => throwError(() => new Error('Сервер недоступен. Попробуйте позже.'))),
    );
  }

  // Получить всех пользователей(GET)
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Получить одного пользователя по ID
  getUserById(userId: number): Observable<any> {
    const url = `${this.apiUrl}/${userId}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Ошибка при получении пользователя:', error);
        return throwError(() => new Error('Ошибка при получении пользователя.'));
      })
    );
  }

  // Зарегистрировать нового пользователя (POST)
  registerUser(user: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, user).pipe(
      catchError((error) => {
        console.error('Ошибка при регистрации пользователя:', error);
        return throwError(() => new Error('Ошибка при регистрации пользователя.'));
      })
    );
  }

  // Проверить, существует ли email
  checkEmailExists(email: string): Observable<any[]> {
    const url = `${this.apiUrl}?email=${email}`;
    return this.http.get<any[]>(url);
  }

  // Метод PUT для обновления пользователя
  updateUser(userId: number, user: any): Observable<any> {
    const url = `${this.apiUrl}/${userId}`;
    return this.http.put<any>(url, user).pipe(
      catchError((error) => {
        console.error('Ошибка при обновлении пользователя:', error);
        return throwError(() => new Error('Ошибка при обновлении пользователя.'));
      })
    );
  }

  // Метод DELETE для удаления пользователя
  deleteUser(userId: number): Observable<any> {
    const url = `${this.apiUrl}/${userId}`;
    return this.http.delete<any>(url).pipe(
      catchError((error) => {
        console.error('Ошибка при удалении пользователя:', error);
        return throwError(() => new Error('Ошибка при удалении пользователя.'));
      })
    );
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const storage = window.localStorage;
      const testKey = '__storage_test__';
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }


  setSession(user: any): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('Сохранён пользователь в localStorage:', user);
    } else {
      console.error('LocalStorage недоступен.');
    }
  }
  
  getSession(): any | null {
    if (this.isLocalStorageAvailable()) {
      const userStr = localStorage.getItem('currentUser');
      console.log('Данные из localStorage:', userStr);
      try {
        return userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        console.error('Ошибка при разборе данных пользователя:', e);
        return null;
      }
    }
    return null;
  }  


  clearSession(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem('currentUser');
    }
  }
}
