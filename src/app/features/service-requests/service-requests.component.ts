import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostListener,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ServiceRequest,
  ServiceRequestStatus,
  ServiceRequestPriority,
} from './service-requests.types';
import { UI_COMPONENTS } from '../../shared/components/ui';

@Component({
  selector: 'app-service-requests',
  templateUrl: './service-requests.component.html',
  styleUrls: ['./service-requests.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ...UI_COMPONENTS],
})
export class ServiceRequestsComponent {
  @Input() serviceRequests: ServiceRequest[] = [];
  @Input() isLoading = false;
  @Input() error: Error | null = null;

  @Output() openNewRequest = new EventEmitter<void>();
  @Output() viewRequestDetails = new EventEmitter<ServiceRequest>();
  @Output() retryLoad = new EventEmitter<void>();

  // Accessibility: track focused item for keyboard navigation
  focusedRequestIndex = -1;

  @ViewChildren('requestItem', { read: ElementRef })
  requestItems!: QueryList<ElementRef>;

  // Keyboard navigation for the service requests list
  @HostListener('keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent): void {
    if (this.serviceRequests.length === 0) return;

    const currentIndex = this.focusedRequestIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedRequestIndex = Math.min(currentIndex + 1, this.serviceRequests.length - 1);
        this.focusRequestItem(this.focusedRequestIndex);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedRequestIndex = Math.max(currentIndex - 1, 0);
        this.focusRequestItem(this.focusedRequestIndex);
        break;
      case 'Home':
        event.preventDefault();
        this.focusedRequestIndex = 0;
        this.focusRequestItem(this.focusedRequestIndex);
        break;
      case 'End':
        event.preventDefault();
        this.focusedRequestIndex = this.serviceRequests.length - 1;
        this.focusRequestItem(this.focusedRequestIndex);
        break;
      case 'Enter':
      case ' ':
        if (currentIndex >= 0) {
          event.preventDefault();
          this.onViewRequestDetails(this.serviceRequests[currentIndex]);
        }
        break;
    }
  }

  // Focus a specific request item by index
  focusRequestItem(index: number): void {
    if (index < 0 || index >= this.serviceRequests.length) return;

    // Use setTimeout to ensure items are rendered before focusing
    setTimeout(() => {
      const itemToFocus = this.requestItems.get(index);
      if (itemToFocus) {
        itemToFocus.nativeElement.focus();
      }
    });
  }

  onOpenNewRequest(): void {
    this.openNewRequest.emit();
  }

  onViewRequestDetails(request: ServiceRequest): void {
    this.viewRequestDetails.emit(request);
  }

  onRetryLoad(): void {
    this.retryLoad.emit();
  }

  getStatusClass(status: ServiceRequestStatus): string {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'in-progress':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
    }
  }

  getPriorityClass(priority: ServiceRequestPriority): string {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'high':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
    }
  }

  // Helper method to get error message safely
  getErrorMessage(): string {
    return this.error && this.error.message
      ? this.error.message
      : 'An unknown error occurred. Please try again later.';
  }
}
