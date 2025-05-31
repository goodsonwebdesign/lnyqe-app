import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, tap, map, switchMap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User, transformUserToViewModel } from '../../models/user.model';
import { UserView } from '../../models/user.model';

interface PaginatedResponse<T> {
  data: T[];
  success: boolean;
  total: number;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  role?: string;
  status?: string;
  department?: string;
}

/**
 * Service for managing users data including pagination and search
 */
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/v1/users`;

  // Cache all users for client-side filtering
  private allUsersCache$ = new BehaviorSubject<UserView[]>([]);

  constructor(private http: HttpClient) {
    console.log('API URL configured as:', this.apiUrl);
  }

  /**
   * Load all users from the API (potentially with a high limit)
   * This loads the complete dataset for client-side searching
   */
  loadAllUsers(): Observable<UserView[]> {
    // Set limit=0 to get all records if the API supports it
    return this.fetchUsers({ page: 0, limit: 0 }).pipe(
      tap(users => this.allUsersCache$.next(users)),
      shareReplay(1)
    );
  }

  /**
   * Get all users and apply filters client-side
   */
  getUsers(filters?: any): Observable<UserView[]> {
    return this.http.get<{ data: User[] }>(`${this.apiUrl}?limit=0`).pipe(
      map(response => response.data.map(transformUserToViewModel)),
      catchError(this.handleError)
    );
  }

  /**
   * Clear the users cache to force a fresh load
   */
  clearCache(): void {
    this.allUsersCache$.next([]);
  }

  /**
   * Fetch users from the API with pagination parameters
   */
  private fetchUsers(params: PaginationParams): Observable<UserView[]> {
    // Build query parameters for pagination
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.sortBy) {
      httpParams = httpParams.set('sort', params.sortBy);
      httpParams = httpParams.set('direction', params.sortDir || 'asc');
    }

    if (params.search) {
      httpParams = httpParams.set('q', params.search);
    }

    return this.http.get<PaginatedResponse<User>>(this.apiUrl, { params: httpParams }).pipe(
      tap((response) => {
        console.log(`Fetched ${response?.data?.length || 0} users out of ${response?.total || 0} total`);
      }),
      map((response) => {
        if (!response?.data || !Array.isArray(response.data)) {
          console.warn('Invalid API response:', response);
          return [];
        }
        return response.data.map(transformUserToViewModel);
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Get a single user by ID
   */
  getUser(id: number): Observable<UserView> {
    return this.http
      .get<User>(`${this.apiUrl}/${id}`)
      .pipe(map(transformUserToViewModel), catchError(this.handleError));
  }

  /**
   * Create a new user
   */
  createUser(user: Partial<User>): Observable<UserView> {
    return this.http
      .post<User>(this.apiUrl, user)
      .pipe(
        map(transformUserToViewModel),
        tap(() => this.clearCache()), // Clear cache to force refresh
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing user
   */
  updateUser(id: number, user: Partial<User>): Observable<UserView> {
    return this.http
      .put<User>(`${this.apiUrl}/${id}`, user)
      .pipe(
        map(transformUserToViewModel),
        tap(() => this.clearCache()), // Clear cache to force refresh
        catchError(this.handleError)
      );
  }

  /**
   * Delete a user
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearCache()), // Clear cache to force refresh
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
      // Handle the case where the server returns HTML instead of JSON with status 200
      if (error.status === 200 && error.error && typeof error.error.text === 'string' &&
          error.error.text.includes('<!doctype html>')) {
        console.error('Server returned HTML instead of JSON. This typically happens when the API route is not properly configured.');
        errorMessage = 'The API endpoint is returning the application instead of data. Please check the server configuration.';
      } else {
        errorMessage = `Server error: ${error.status}. ${error.error?.message || 'An unknown error occurred'}`;
      }
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
