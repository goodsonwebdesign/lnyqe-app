import { createSelector } from '@ngrx/store';
import * as fromServiceRequests from '../reducers/service-request.reducer';

// Import the feature selectors
export const {
  selectServiceRequestsState,
  selectIds,
  selectEntities,
  selectLoading: selectServiceRequestsLoading,
  selectError: selectServiceRequestsError,
  selectSelectedRequestId
} = fromServiceRequests.serviceRequestFeature;

// Use the exported adapter selectors
export const selectAllServiceRequests = fromServiceRequests.selectAll;
export const selectServiceRequestsTotal = fromServiceRequests.selectTotal;

// Select the currently selected service request
export const selectSelectedServiceRequest = createSelector(
  selectEntities,
  selectSelectedRequestId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);

// Create a view model for the service requests list
export const selectServiceRequestsViewModel = createSelector(
  selectAllServiceRequests,
  selectServiceRequestsLoading,
  selectServiceRequestsError,
  (serviceRequests, isLoading, error) => ({
    serviceRequests,
    isLoading,
    error
  })
);