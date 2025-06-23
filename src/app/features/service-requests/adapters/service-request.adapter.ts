import { Injectable } from '@angular/core';
import {
  ServiceRequest,
  ServiceRequestStatus,
  ServiceRequestPriority,
} from '../service-requests.types';

// API-specific interfaces for type safety
export interface ServiceRequestApiResponse {
  requestId?: string;
  id?: string;
  title?: string;
  requestTitle?: string;
  description?: string;
  requestDescription?: string;
  status?: string;
  requestStatus?: string;
  priority?: string;
  requestPriority?: string;
  dateCreated?: string | number;
  createdDate?: string | number;
  requestedBy?: string;
  requesterName?: string;
  assignedTo?: string;
  assigneeUser?: string;
}

export interface ServiceRequestApiPayload {
  requestId: string;
  title: string;
  description: string;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  createdDate: string;
  requesterName: string;
  assigneeUser: string | undefined;
}

/**
 * Adapter for handling API response transformation for service requests
 * Implements the Adapter Pattern from our coding standards
 */
@Injectable({
  providedIn: 'root',
})
export class ServiceRequestAdapter {
  /**
   * Adapts API response data to our internal ServiceRequest model
   * @param apiResponse The raw API response
   * @returns An array of ServiceRequest objects
   */
  adaptFromApi(apiResponse: ServiceRequestApiResponse[]): ServiceRequest[] {
    return apiResponse.map((item) => this.adaptSingleItem(item));
  }

  /**
   * Adapts a single API response item to our internal ServiceRequest model
   * @param item A single item from the API response
   * @returns A ServiceRequest object
   */
  adaptSingleItem(item: ServiceRequestApiResponse): ServiceRequest {
    return {
      // TODO: Add proper validation or error handling for missing required fields from the API
      id: item.requestId || item.id || '',
      title: item.title || item.requestTitle || '',
      description: item.description || item.requestDescription || '',
      status: this.normalizeStatus(item.status || item.requestStatus),
      priority: this.normalizePriority(item.priority || item.requestPriority),
      dateCreated: new Date(item.dateCreated || item.createdDate || Date.now()),
      requestedBy: item.requestedBy || item.requesterName || '',
      assignedTo: item.assignedTo || item.assigneeUser,
    };
  }

  /**
   * Adapts our internal ServiceRequest model to the format expected by the API
   * @param request The ServiceRequest to adapt
   * @returns The request formatted for the API
   */
  adaptToApi(request: ServiceRequest): ServiceRequestApiPayload {
    return {
      requestId: request.id,
      title: request.title,
      description: request.description,
      status: request.status,
      priority: request.priority,
      createdDate: request.dateCreated.toISOString(),
      requesterName: request.requestedBy,
      assigneeUser: request.assignedTo,
    };
  }

  /**
   * Normalizes various status values to our standard statuses
   * @param status The status from the API
   * @returns A normalized status string
   * @private
   */
  private normalizeStatus(status: string): ServiceRequestStatus {
    const statusMap: Record<string, ServiceRequestStatus> = {
      open: 'new',
      in_progress: 'in-progress',
      'in progress': 'in-progress',
      complete: 'completed',
      closed: 'completed',
      cancelled: 'cancelled',
      canceled: 'cancelled',
    };

    const normalizedStatus = statusMap[status.toLowerCase()];

    // Return default 'new' status if the mapped value doesn't match any valid status
    if (!normalizedStatus) {
      console.warn(`Unknown status: ${status}, defaulting to 'new'`);
      return 'new';
    }

    return normalizedStatus;
  }

  /**
   * Normalizes various priority values to our standard priorities
   * @param priority The priority from the API
   * @returns A normalized priority string
   * @private
   */
  private normalizePriority(priority: string): ServiceRequestPriority {
    const priorityMap: Record<string, ServiceRequestPriority> = {
      '1': 'urgent',
      '2': 'high',
      '3': 'medium',
      '4': 'low',
      critical: 'urgent',
      important: 'high',
      normal: 'medium',
      low_priority: 'low',
    };

    const normalizedPriority = priorityMap[priority.toLowerCase()];

    // Return default 'medium' priority if the mapped value doesn't match any valid priority
    if (!normalizedPriority) {
      console.warn(`Unknown priority: ${priority}, defaulting to 'medium'`);
      return 'medium';
    }

    return normalizedPriority;
  }
}
