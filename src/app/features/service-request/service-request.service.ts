import { Injectable, inject } from '@angular/core';
import { FlyoutService } from '../../core/services/flyout/flyout.service';

/**
 * Service for managing the service request popup/flyout
 */
@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {
  private flyoutService = inject(FlyoutService);

  // Opens the service request flyout
  openServiceRequest(position: 'right' | 'left' | 'bottom' = 'right'): void {
    // Simply open the flyout with the service-request type
    this.flyoutService.openFlyout('service-request', position);
  }

  // Closes the service request flyout
  closeServiceRequest(): void {
    this.flyoutService.closeFlyout();
  }
}
