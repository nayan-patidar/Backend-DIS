import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Role } from '../models/role.enum';
import { API_BASE_URL } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) {}

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user).pipe(
      catchError(err => {
        console.warn('Backend offline. Creating user locally.');
        const str = localStorage.getItem('mock_users');
        const mockUsers = str ? JSON.parse(str) : [];
        const newUser = { ...user, userId: Math.floor(Math.random() * 1000) + 10 };
        mockUsers.push(newUser);
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
        return of(newUser);
      })
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(err => {
        console.warn('Backend offline. Fetching users locally.');
        const str = localStorage.getItem('mock_users');
        return of(str ? JSON.parse(str) : []);
      })
    );
  }
}
