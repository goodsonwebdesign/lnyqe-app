import { ServiceRequest } from '../../features/service-requests/service-requests.types';
import { ServiceRequestActions } from '../actions/service-request.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';

export interface ServiceRequestState extends EntityState<ServiceRequest> {
  loading: boolean;
  error: any | null;
  selectedRequestId: string | null;
}

export const adapter: EntityAdapter<ServiceRequest> = createEntityAdapter<ServiceRequest>({
  selectId: (request: ServiceRequest) => request.id,
  sortComparer: (a: ServiceRequest, b: ServiceRequest) =>
    new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
});

export const initialState: ServiceRequestState = adapter.getInitialState({
  loading: false,
  error: null,
  selectedRequestId: null,
});

// Create selectors from adapter that we can export
const adapterSelectors = adapter.getSelectors();

export const serviceRequestFeature = createFeature({
  name: 'serviceRequests',
  reducer: createReducer(
    initialState,

    // Load Service Requests
    on(ServiceRequestActions.loadServiceRequests, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(ServiceRequestActions.loadServiceRequestsSuccess, (state, { requests }) =>
      adapter.setAll(requests, {
        ...state,
        loading: false,
      }),
    ),
    on(ServiceRequestActions.loadServiceRequestsFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    // Load Single Service Request
    on(ServiceRequestActions.loadServiceRequest, (state, { id }) => ({
      ...state,
      loading: true,
      error: null,
      selectedRequestId: id,
    })),
    on(ServiceRequestActions.loadServiceRequestSuccess, (state, { request }) =>
      adapter.upsertOne(request, {
        ...state,
        loading: false,
      }),
    ),
    on(ServiceRequestActions.loadServiceRequestFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    // Create Service Request
    on(ServiceRequestActions.createServiceRequest, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(ServiceRequestActions.createServiceRequestSuccess, (state, { request }) =>
      adapter.addOne(request, {
        ...state,
        loading: false,
      }),
    ),
    on(ServiceRequestActions.createServiceRequestFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    // Update Service Request
    on(ServiceRequestActions.updateServiceRequest, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(ServiceRequestActions.updateServiceRequestSuccess, (state, { request }) =>
      adapter.updateOne(
        { id: request.id, changes: request },
        {
          ...state,
          loading: false,
        },
      ),
    ),
    on(ServiceRequestActions.updateServiceRequestFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    // Delete Service Request
    on(ServiceRequestActions.deleteServiceRequest, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(ServiceRequestActions.deleteServiceRequestSuccess, (state, { id }) =>
      adapter.removeOne(id, {
        ...state,
        loading: false,
      }),
    ),
    on(ServiceRequestActions.deleteServiceRequestFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
  ),
});

// Export the feature's generated selectors
export const {
  name,
  reducer,
  selectServiceRequestsState,
  selectIds,
  selectEntities,
  selectLoading,
  selectError,
  selectSelectedRequestId,
} = serviceRequestFeature;

// Export adapter selectors that we need to wrap with our feature state
export const selectAll = (state: any) =>
  adapterSelectors.selectAll(selectServiceRequestsState(state));

export const selectTotal = (state: any) =>
  adapterSelectors.selectTotal(selectServiceRequestsState(state));
