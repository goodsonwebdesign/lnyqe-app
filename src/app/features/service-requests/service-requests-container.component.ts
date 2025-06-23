import { Component, inject, OnInit } from '@angular/core';
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
    <ng-container *ngIf="viewModel$ | async as vm">
      <app-service-requests
        [serviceRequests]="vm.serviceRequests || []"
        [isLoading]="vm.isLoading || false"
        [error]="vm.error"
        (openNewRequest)="onOpenNewRequest()"
        (viewRequestDetails)="onViewRequestDetails($event)"
        (retryLoad)="loadServiceRequests()"
      >
      </app-service-requests>
    </ng-container>
  `,
  styles: [],
  standalone: true,
  imports: [CommonModule, ServiceRequestsComponent],
  providers: [ServiceRequestRepository, ServiceRequestAdapter],
})
export class ServiceRequestsContainerComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  viewModel$: Observable<ServiceRequestViewModel> = this.store.select(
    selectServiceRequestsViewModel
  );

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
