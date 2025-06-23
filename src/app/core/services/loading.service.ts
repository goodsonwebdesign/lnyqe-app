import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * Show the loading indicator
   */
  show(): void {
    this.loadingSubject.next(true);
  }

  /**
   * Hide the loading indicator
   */
  hide(): void {
    this.loadingSubject.next(false);
  }

}
