import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';

/**
 * HTTP interceptor for handling API requests
 * Adds required headers and auth token for API requests
 */
@Injectable()
export class CorsInterceptor implements HttpInterceptor {
  private store = inject(Store);
  private authService = inject(AuthService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only modify API requests
    if (request.url.includes('/api/')) {
      // Get the headers we want to add
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      };

      // Clone the request with the headers
      const modifiedRequest = request.clone({
        setHeaders: headers
      });

      return next.handle(modifiedRequest);
    }

    // For non-API requests, pass through unchanged
    return next.handle(request);
  }
}