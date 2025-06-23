import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/users';

  getUsers(): Observable<User[]> {
    return this.http.get<{ data: User[] }>(this.apiUrl).pipe(
      map((response) => response.data)
    );
  }

  getMe(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`).pipe(
      map((response) => response.user)
    );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/${id}`).pipe(
      map((response) => response.user)
    );
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<{ user: User }>(this.apiUrl, user).pipe(
      map((response) => response.user)
    );
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<{ user: User }>(`${this.apiUrl}/${id}`, user).pipe(
      map((response) => response.user)
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
