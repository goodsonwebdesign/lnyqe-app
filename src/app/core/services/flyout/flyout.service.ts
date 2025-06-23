import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FlyoutState<T = unknown> {
  isOpen: boolean;
  position: 'right' | 'left' | 'bottom';
  type: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class FlyoutService {
  private flyoutState = new BehaviorSubject<FlyoutState<unknown>>({
    isOpen: false,
    position: 'right',
    type: '',
    data: undefined,
  });

  getState(): Observable<FlyoutState<unknown>> {
    return this.flyoutState.asObservable();
  }

  /**
   * Opens a flyout panel with the specified type, position and optional data
   * @param type The type identifier for the flyout
   * @param position The position of the flyout ('right', 'left', or 'bottom')
   * @param data Optional data to pass to the flyout component
   */
  openFlyout<T>(type: string, position: 'right' | 'left' | 'bottom' = 'right', data?: T): void {
    if (!type) {
      console.error('FlyoutService: Cannot open flyout without a type');
      return;
    }

    this.flyoutState.next({
      isOpen: true,
      position,
      type,
      data,
    });
  }

  /**
   * Closes the currently open flyout
   */
  closeFlyout(): void {
    this.flyoutState.next({
      isOpen: false,
      position: 'right',
      type: '',
      data: undefined,
    });
  }

  /**
   * Updates the data in the current flyout without changing its open state
   * @param data The new data to be passed to the flyout
   */
  updateFlyoutData<T>(data: T): void {
    const currentState = this.flyoutState.getValue();
    if (!currentState.isOpen) {
      console.warn('FlyoutService: Cannot update data when flyout is closed.');
      return;
    }

    this.flyoutState.next({
      ...currentState,
      data,
    });
  }
}
