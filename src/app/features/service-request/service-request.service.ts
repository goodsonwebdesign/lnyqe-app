import { Injectable, inject } from '@angular/core';
import { FlyoutService } from '../../core/services/flyout/flyout.service';
import { ServiceRequestComponent } from './service-request.component';

/**
 * Service for managing the service request popup/flyout
 * This follows the architectural pattern of separating business logic from UI components
 */
@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {
  private flyoutService = inject(FlyoutService);

  // Opens the service request flyout
  openServiceRequest(position: 'right' | 'left' | 'bottom' = 'right'): void {
    this.flyoutService.openFlyout('service-request', position);
  }

  // Closes the service request flyout
  closeServiceRequest(): void {
    this.flyoutService.closeFlyout();
  }
}
