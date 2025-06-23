import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';
import { switchMap } from 'rxjs/operators';

/**
 * HTTP interceptor for handling API requests
 * Adds required headers and auth token for API requests
 */
@Injectable()
export class CorsInterceptor implements HttpInterceptor {
  private store = inject(Store);
  private authService = inject(AuthService);

  // Get API identifier from environment config
  private apiIdentifier = environment.auth.apiAudience;




  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isApiUrl = request.url.includes(environment.apiUrl); // Use environment.apiUrl for matching

    // Only modify API requests
    if (isApiUrl) {
      return from(this.authService.getApiAccessToken(this.apiIdentifier)).pipe(
        switchMap((token) => {
                    const headers: Record<string, string> = {};

          // Set Content-Type if not already set. Some requests (like FormData for file uploads) 
          // rely on the browser to set the Content-Type with the correct boundary.
          if (!request.headers.has('Content-Type')) {
            headers['Content-Type'] = 'application/json';
          }

          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const modifiedRequest = request.clone({
            setHeaders: headers,
          });

          return next.handle(modifiedRequest);
        }),
      );
    }

    // For non-API requests, pass through unchanged
    return next.handle(request);
  }
}
