import { Injectable, ApplicationRef, createComponent, EnvironmentInjector, inject, ComponentRef, NgZone } from '@angular/core';
import { ServiceRequestComponent } from '../../../features/service-request/service-request.component';

/**
 * Service for managing popup components in the application
 * This service handles dynamic component creation and attachment to the DOM
 */
@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private ngZone = inject(NgZone);

  private serviceRequestComponentRef: ComponentRef<ServiceRequestComponent> | null = null;
  private isAppStable = false;

  constructor() {
    // Wait for the app to be stable before creating any components
    this.appRef.isStable.subscribe(isStable => {
      if (isStable) {
        this.isAppStable = true;
        // Now it's safe to create components
        this.initializeComponentsIfNeeded();
      }
    });
  }

  /**
   * Ensures the service request component is created and attached to the DOM
   * This allows it to be shown/hidden via the FlyoutService without being part of any template
   */
  ensureServiceRequestComponentExists(): void {
    // Only create the component if the app is stable
    if (this.isAppStable && !this.serviceRequestComponentRef) {
      try {
        // Create the component dynamically
        this.serviceRequestComponentRef = createComponent(ServiceRequestComponent, {
          environmentInjector: this.injector,
          hostElement: document.body
        });

        // Attach it to the application change detection
        this.appRef.attachView(this.serviceRequestComponentRef.hostView);

        // Mark for check to ensure changes are detected
        this.serviceRequestComponentRef.changeDetectorRef.detectChanges();

        console.log('ServiceRequestComponent created and attached to DOM');
      } catch (error) {
        console.error('Error creating ServiceRequestComponent:', error);
      }
    }
  }

  /**
   * Initialize components if the app is already stable
   */
  private initializeComponentsIfNeeded(): void {
    if (this.isAppStable) {
      this.ensureServiceRequestComponentExists();
    }
  }

  /**
   * Initialize all popup components needed in the application
   * Call this method from app initialization
   */
  initializePopupComponents(): void {
    // Don't actually create components here, just mark our intent
    // Real initialization will happen after the app is stable
    console.log('PopupService initialization triggered');

    // If app is already stable, initialize immediately
    if (this.isAppStable) {
      this.initializeComponentsIfNeeded();
    }

    // Otherwise wait for app stability (handled in constructor)
  }
}
