import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';

/**
 * @description Attaches a bearer token to outgoing API requests.
 * It intercepts requests directed to the application's API URL (prefixed with '/api'),
 * fetches a fresh token using the AuthService, and adds it to the
 * Authorization header.
 */
@Injectable()
export class CorsInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const isApiUrl = request.url.startsWith('/api');

    if (!isApiUrl) {
      return next.handle(request);
    }

    return this.authService.isAuthenticated$.pipe(
      take(1),
      switchMap((isAuthenticated) => {
        if (!isAuthenticated) {
          // If not authenticated, proceed without the token.
          return next.handle(request);
        }

        return this.authService.apiToken$.pipe(
          take(1),
          switchMap((token) => {
            if (token) {
              request = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`,
                },
              });
            }
            return next.handle(request);
          })
        );
      })
    );
  }
}
