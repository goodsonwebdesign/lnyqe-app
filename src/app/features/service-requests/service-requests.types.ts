// Types for service requests components
export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  dateCreated: Date;
  requestedBy: string;
  assignedTo?: string;
}

export type ServiceRequestStatus = 'new' | 'in-progress' | 'completed' | 'cancelled';
export type ServiceRequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ServiceRequestViewModel {
  serviceRequests: ServiceRequest[];
  isLoading: boolean;
  error: any;
}