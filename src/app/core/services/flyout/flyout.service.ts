import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FlyoutState {
  isOpen: boolean;
  position: 'right' | 'left' | 'bottom';
  type: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class FlyoutService {
  private initialState: FlyoutState = {
    isOpen: false,
    position: 'right',
    type: '',
  };

  private flyoutState = new BehaviorSubject<FlyoutState>(this.initialState);

  constructor() {}

  getState(): Observable<FlyoutState> {
    return this.flyoutState.asObservable();
  }

  /**
   * Opens a flyout panel with the specified type, position and optional data
   * @param type The type identifier for the flyout
   * @param position The position of the flyout ('right', 'left', or 'bottom')
   * @param data Optional data to pass to the flyout component
   */
  openFlyout(type: string, position: 'right' | 'left' | 'bottom' = 'right', data?: any): void {
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
      ...this.flyoutState.value,
      isOpen: false,
    });
  }

  /**
   * Updates the data in the current flyout without changing its open state
   * @param data The new data to be passed to the flyout
   */
  updateFlyoutData(data: any): void {
    this.flyoutState.next({
      ...this.flyoutState.value,
      data,
    });
  }
}
