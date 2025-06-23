import {
  Component,
  inject,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlyoutService } from '../../core/services/flyout/flyout.service';
import { Subject, takeUntil } from 'rxjs';
import { ServiceRequestFormComponent } from './components/service-request-form/service-request-form.component';
import { ServiceRequest } from '../service-requests/service-requests.types';

// Define the expected payload structure for this flyout type
interface ServiceRequestFlyoutPayload {
  editing: boolean;
  request: ServiceRequest | null;
}

@Component({
  selector: 'app-service-request',
  standalone: true,
  imports: [CommonModule, ServiceRequestFormComponent],
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceRequestComponent implements OnDestroy {
  private flyoutService = inject(FlyoutService);
  private cd = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  isOpen = false;
  editing = false;
  requestData: ServiceRequest | null = null;

  constructor() {
    this.flyoutService
      .getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        if (state.type === 'service-request') {
          // Assert the type of the data payload
          const data = state.data as ServiceRequestFlyoutPayload;
          this.isOpen = state.isOpen;
          this.editing = data?.editing ?? false;
          this.requestData = data?.request ?? null;
          this.cd.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.flyoutService.closeFlyout();
  }

  onFormSubmit(formData: ServiceRequest): void {
    console.log('Form submitted:', formData);
    // Here you would typically dispatch an action to save the data
    this.close();
  }
}

