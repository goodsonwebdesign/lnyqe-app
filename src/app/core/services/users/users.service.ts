import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User, transformUserToViewModel } from '../../models/user.model';
import { UserView } from '../../../features/users-management/users-management.types';

interface PaginatedResponse<T> {
  count: number;
  users: T[];
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/v1/users`;

  constructor(private http: HttpClient) {
    console.log('API URL configured as:', this.apiUrl);
  }

  /**
   * Get all users from the API
   * @returns Observable of users array
   */
  getUsers(): Observable<UserView[]> {
    console.log('Fetching users from:', this.apiUrl);
    return this.http.get<PaginatedResponse<User>>(this.apiUrl).pipe(
      tap(response => {
        console.log('Raw API response:', response);
        if (!response?.users || !Array.isArray(response.users)) {
          console.warn('Invalid API response:', response);
        } else {
          console.log(`Fetched ${response.users.length} users out of ${response.count} total`);
        }
      }),
      map(response => {
        if (!response?.users || !Array.isArray(response.users)) return [];
        return response.users.map(transformUserToViewModel);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get a single user by ID
   * @param id User ID
   * @returns Observable of single user
   */
  getUser(id: string): Observable<UserView> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      map(transformUserToViewModel),
      catchError(this.handleError)
    );
  }

  /**
   * Create a new user
   * @param user User data
   * @returns Observable of created user
   */
  createUser(user: Partial<User>): Observable<UserView> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      map(transformUserToViewModel),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param user Updated user data
   * @returns Observable of updated user
   */
  updateUser(id: string, user: Partial<User>): Observable<UserView> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      map(transformUserToViewModel),
      catchError(this.handleError)
    );
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Observable of void
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Error handler for HTTP requests
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';

    if (error.status === 0) {
      errorMessage = 'A network error occurred. Please check your connection.';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.status}. ${error.error?.message || 'An unknown error occurred'}`;
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
