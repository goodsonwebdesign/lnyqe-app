import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject, Injectable } from '@angular/core';
import { ErrorService } from '../services/error/error.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private errorService = inject(ErrorService);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.errorService.log(error);
        return throwError(() => error);
      })
    );
  }
}
