import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User, transformUserToViewModel } from '../../models/user.model';
import { UserView } from '../../models/user.model';

interface PaginatedResponse<T> {
  data: T[];
  success: boolean;
  total: number;
}

@Injectable({
  providedIn: 'root',
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
    return this.http.get<any>(this.apiUrl).pipe(
      tap((response) => {
        console.log('Raw API response type:', typeof response);
        console.log('Raw API response:', response);
      }),
      map((response) => {
        // Handle different API response formats
        if (Array.isArray(response)) {
          // If the response is already an array, use it directly
          return response.map(transformUserToViewModel);
        } else if (response?.data && Array.isArray(response.data)) {
          // If response has a data property that's an array, use that
          return response.data.map(transformUserToViewModel);
        } else if (response && typeof response === 'object') {
          // If response is an object but doesn't have the expected structure,
          // try to extract users from it
          const potentialUsers = Object.values(response).find(Array.isArray);
          if (potentialUsers) {
            return potentialUsers.map(transformUserToViewModel);
          }
        }

        console.warn('Could not parse users from API response:', response);
        return []; // Return empty array as fallback
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Get a single user by ID
   * @param id User ID
   * @returns Observable of single user
   */
  getUser(id: number): Observable<UserView> {
    return this.http
      .get<User>(`${this.apiUrl}/${id}`)
      .pipe(map(transformUserToViewModel), catchError(this.handleError));
  }

  /**
   * Create a new user
   * @param user User data
   * @returns Observable of created user
   */
  createUser(user: Partial<User>): Observable<UserView> {
    return this.http
      .post<User>(this.apiUrl, user)
      .pipe(map(transformUserToViewModel), catchError(this.handleError));
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param user Updated user data
   * @returns Observable of updated user
   */
  updateUser(id: number, user: Partial<User>): Observable<UserView> {
    return this.http
      .put<User>(`${this.apiUrl}/${id}`, user)
      .pipe(map(transformUserToViewModel), catchError(this.handleError));
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Observable of void
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
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
      // Don't treat 200 as an error
      if (error.status === 200) {
        console.warn('Received HTTP 200 in error handler, this should not happen', error);
        return throwError(() => new Error('Unexpected response format from server'));
      }
      errorMessage = `Server error: ${error.status}. ${error.error?.message || 'An unknown error occurred'}`;
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
