import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';
import { take, switchMap, tap } from 'rxjs/operators';

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

  constructor() {
    console.log('CORS Interceptor initialized with API audience:', this.apiIdentifier);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`CORS Interceptor: Request URL: ${request.url}`);

    // Only modify API requests
    if (request.url.includes('/api/')) {
      console.log(`CORS Interceptor: Handling API request to ${request.url}`);
      console.log(`CORS Interceptor: Using API audience: ${this.apiIdentifier}`);

      // Get a token with the correct audience specifically for API calls
      return from(this.authService.getTokenSilently()).pipe(
        tap((tokenResponse) => {
          const token = tokenResponse?.accessToken;
          if (!token) {
            console.warn('No access token available');
            return;
          }
          // For debugging - decode and log token audience (without showing the full token)
          if (token) {
            try {
              const tokenParts = token.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log('API Token audience:', payload.aud);

                // Verify the token has the correct audience
                if (Array.isArray(payload.aud)) {
                  if (!payload.aud.includes(this.apiIdentifier)) {
                    console.warn(
                      `Token has incorrect audience: ${payload.aud.join(', ')}. Expected: ${this.apiIdentifier}`,
                    );
                  } else {
                    console.log('Token has correct audience');
                  }
                } else if (payload.aud !== this.apiIdentifier) {
                  console.warn(
                    `Token has incorrect audience: ${payload.aud}. Expected: ${this.apiIdentifier}`,
                  );
                } else {
                  console.log('Token has correct audience');
                }
              }
            } catch (e) {
              console.error('Error decoding token:', e);
            }
          }
        }),
        switchMap((apiToken) => {
          const headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
          };

          // Add Authorization header with the API-specific token
          if (apiToken) {
            headers['Authorization'] = `Bearer ${apiToken}`;
            console.log('Added API token to request headers');
          } else {
            console.warn('No API token available for request');
          }

          // Clone the request with the headers
          const modifiedRequest = request.clone({
            setHeaders: headers,
          });

          return next.handle(modifiedRequest);
        }),
      );
    }

    // For non-API requests, pass through unchanged
    console.log('CORS Interceptor: Passing through non-API request');
    return next.handle(request);
  }
}
