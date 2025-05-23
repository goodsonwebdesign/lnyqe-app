import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * HTTP interceptor for handling API requests
 * This interceptor ensures the Content-Type header is set correctly
 * but doesn't modify the URL, allowing the proxy config to handle routing
 */
@Injectable()
export class CorsInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only modify API requests
    if (request.url.includes('/api/')) {
      // Clone the request with just the Content-Type header
      // We don't need to modify the URL - the proxy will handle that
      const modifiedRequest = request.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });
      
      return next.handle(modifiedRequest);
    }
    
    // For non-API requests, pass through unchanged
    return next.handle(request);
  }
}