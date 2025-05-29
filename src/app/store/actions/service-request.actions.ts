import { ServiceRequest } from '../../features/service-requests/service-requests.types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const ServiceRequestActions = createActionGroup({
  source: 'Service Requests',
  events: {
    'Load Service Requests': emptyProps(),
    'Load Service Requests Success': props<{ requests: ServiceRequest[] }>(),
    'Load Service Requests Failure': props<{ error: any }>(),

    'Load Service Request': props<{ id: string }>(),
    'Load Service Request Success': props<{ request: ServiceRequest }>(),
    'Load Service Request Failure': props<{ error: any }>(),

    'Create Service Request': props<{ request: ServiceRequest }>(),
    'Create Service Request Success': props<{ request: ServiceRequest }>(),
    'Create Service Request Failure': props<{ error: any }>(),

    'Update Service Request': props<{ request: ServiceRequest }>(),
    'Update Service Request Success': props<{ request: ServiceRequest }>(),
    'Update Service Request Failure': props<{ error: any }>(),

    'Delete Service Request': props<{ id: string }>(),
    'Delete Service Request Success': props<{ id: string }>(),
    'Delete Service Request Failure': props<{ error: any }>(),
  },
});
