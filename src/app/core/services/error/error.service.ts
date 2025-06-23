import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  log(error: unknown): void {
    // In a real-world app, you might send this to a remote logging service
    console.error('An error occurred:', error);
  }
}
