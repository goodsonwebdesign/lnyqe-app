import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ServiceRequest, ServiceRequestViewModel } from './service-requests.types';
import { ServiceRequestActions } from '../../store/actions/service-request.actions';
import { selectServiceRequestsViewModel } from '../../store/selectors/service-request.selectors';
import { ServiceRequestsComponent } from './service-requests.component';
import { ServiceRequestRepository } from './repositories/service-request.repository';
import { ServiceRequestAdapter } from './adapters/service-request.adapter';

@Component({
  selector: 'app-service-requests-container',
  template: `
    <app-service-requests
      [serviceRequests]="(viewModel$ | async)?.serviceRequests || []"
      [isLoading]="(viewModel$ | async)?.isLoading || false"
      [error]="(viewModel$ | async)?.error"
      (openNewRequest)="onOpenNewRequest()"
      (viewRequestDetails)="onViewRequestDetails($event)"
      (retryLoad)="loadServiceRequests()"
    >
    </app-service-requests>
  `,
  styles: [],
  standalone: true,
  imports: [CommonModule, ServiceRequestsComponent],
  providers: [ServiceRequestRepository, ServiceRequestAdapter],
})
export class ServiceRequestsContainerComponent implements OnInit {
  viewModel$: Observable<ServiceRequestViewModel>;

  constructor(
    private store: Store,
    private router: Router,
  ) {
    this.viewModel$ = this.store.select(selectServiceRequestsViewModel);
  }

  ngOnInit(): void {
    this.loadServiceRequests();
  }

  loadServiceRequests(): void {
    this.store.dispatch(ServiceRequestActions.loadServiceRequests());
  }

  onOpenNewRequest(): void {
    this.router.navigate(['/features/service-request']);
  }

  onViewRequestDetails(request: ServiceRequest): void {
    this.router.navigate(['/features/service-request', request.id]);
  }
}
