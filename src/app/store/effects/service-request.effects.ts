import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, concatMap } from 'rxjs/operators';
import { ServiceRequestRepository } from '../../features/service-requests/repositories/service-request.repository';
import { ServiceRequestActions } from '../actions/service-request.actions';

@Injectable()
export class ServiceRequestEffects {
  private actions$ = inject(Actions);
  private repository = inject(ServiceRequestRepository);

  loadServiceRequests$ = createEffect(() => this.actions$.pipe(
    ofType(ServiceRequestActions.loadServiceRequests),
    switchMap(() => this.repository.getAll().pipe(
      map(requests => ServiceRequestActions.loadServiceRequestsSuccess({ requests })),
      catchError(error => of(ServiceRequestActions.loadServiceRequestsFailure({ error })))
    ))
  ));

  loadServiceRequest$ = createEffect(() => this.actions$.pipe(
    ofType(ServiceRequestActions.loadServiceRequest),
    switchMap(({ id }) => this.repository.getById(id).pipe(
      map(request => {
        if (!request) {
          throw new Error(`Service request with ID ${id} not found`);
        }
        return ServiceRequestActions.loadServiceRequestSuccess({ request });
      }),
      catchError(error => of(ServiceRequestActions.loadServiceRequestFailure({ error })))
    ))
  ));

  createServiceRequest$ = createEffect(() => this.actions$.pipe(
    ofType(ServiceRequestActions.createServiceRequest),
    concatMap(({ request }) => this.repository.create(request).pipe(
      map(createdRequest => ServiceRequestActions.createServiceRequestSuccess({ request: createdRequest })),
      catchError(error => of(ServiceRequestActions.createServiceRequestFailure({ error })))
    ))
  ));

  updateServiceRequest$ = createEffect(() => this.actions$.pipe(
    ofType(ServiceRequestActions.updateServiceRequest),
    concatMap(({ request }) => this.repository.update(request).pipe(
      map(updatedRequest => ServiceRequestActions.updateServiceRequestSuccess({ request: updatedRequest })),
      catchError(error => of(ServiceRequestActions.updateServiceRequestFailure({ error })))
    ))
  ));

  deleteServiceRequest$ = createEffect(() => this.actions$.pipe(
    ofType(ServiceRequestActions.deleteServiceRequest),
    concatMap(({ id }) => this.repository.delete(id).pipe(
      map(success => {
        if (!success) {
          throw new Error(`Failed to delete service request with ID ${id}`);
        }
        return ServiceRequestActions.deleteServiceRequestSuccess({ id });
      }),
      catchError(error => of(ServiceRequestActions.deleteServiceRequestFailure({ error })))
    ))
  ));
}