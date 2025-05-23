import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  // The API URL should not include /api twice
  // environment.apiUrl is already '/api'
  private apiUrl = `${environment.apiUrl}/v1/users`;

  constructor(private http: HttpClient) {
    console.log('API URL configured as:', this.apiUrl);
  }

  /**
   * Get all users from the API
   * @param token Authentication token
   * @returns Observable of users response with expected format { message: "List users endpoint" }
   */
  getUsers(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(this.apiUrl, {
      headers
    }).pipe(
      tap(response => console.log('Users API response:', response)),
      map(response => {
        // Check if response has the expected message property
        if (response && response.message === "List users endpoint") {
          // This is a successful response with just a message
          return response;
        }

        // Check if response has users array property
        if (response && Array.isArray(response.users)) {
          return response;
        }

        // If the response has a different format, transform it to maintain consistency
        return { message: "Users retrieved successfully", data: response };
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Error handler for HTTP requests
   * @param error The HTTP error response
   * @returns An observable with the error message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';

    if (error.status === 0) {
      // A client-side or network error occurred
      errorMessage = `Network error: ${error.error}`;
      console.error('An error occurred:', error.error);
    } else if (error.error instanceof ErrorEvent) {
      // A client-side error occurred
      errorMessage = `Error: ${error.error.message}`;
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code
      errorMessage = `Server returned code ${error.status}, body was: ${error.error}`;
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }

    // If we have a text response from the server, log it
    if (error.error && typeof error.error === 'string') {
      console.error('Server response text:', error.error);
    }

    // Return an observable with a user-facing error message
    return throwError(() => new Error(`Something went wrong: ${errorMessage}`));
  }
}
