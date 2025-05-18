import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { ServiceRequest } from '../service-requests.types';
import { environment } from '../../../../environments/environment';

/**
 * Repository for Service Requests
 * 
 * This repository provides data access operations for service requests
 * and abstracts away the details of the API calls.
 */
@Injectable({
  providedIn: 'root'
})
export class ServiceRequestsRepository {
  private apiUrl = `${environment.apiUrl}/service-requests`;
  
  // Sample data for demonstration purposes - would be removed in production
  private mockData: ServiceRequest[] = [
    {
      id: 'SR-001',
      title: 'HVAC Maintenance',
      description: 'Regular maintenance check for HVAC system in Building A',
      status: 'in-progress',
      priority: 'medium',
      dateCreated: new Date('2025-04-29'),
      requestedBy: 'Jane Smith',
      assignedTo: 'Tech Team Alpha'
    },
    {
      id: 'SR-002',
      title: 'Broken Window',
      description: 'Window broken in conference room B on the 3rd floor',
      status: 'new',
      priority: 'high',
      dateCreated: new Date('2025-05-02'),
      requestedBy: 'John Doe'
    },
    {
      id: 'SR-003',
      title: 'Lighting Replacement',
      description: 'Replace burned out lights in parking garage Level 2',
      status: 'new',
      priority: 'low',
      dateCreated: new Date('2025-05-01'),
      requestedBy: 'Mark Johnson'
    },
    {
      id: 'SR-004',
      title: 'Water Leak',
      description: 'Water leaking from ceiling in room 405',
      status: 'in-progress',
      priority: 'urgent',
      dateCreated: new Date('2025-05-03'),
      requestedBy: 'Sarah Williams',
      assignedTo: 'Plumbing Team'
    },
    {
      id: 'SR-005',
      title: 'Network Outage',
      description: 'Internet connectivity issues on the 5th floor',
      status: 'completed',
      priority: 'high',
      dateCreated: new Date('2025-04-25'),
      requestedBy: 'David Chen',
      assignedTo: 'IT Support'
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get all service requests
   * @returns Observable of ServiceRequest array
   */
  getAll(): Observable<ServiceRequest[]> {
    // In a real app, would use HTTP client to fetch from API
    // return this.http.get<ServiceRequest[]>(this.apiUrl)
    //   .pipe(
    //     catchError(this.handleError)
    //   );
    
    // For demo, using mock data with artificial delay
    return of(this.mockData).pipe(
      delay(1000), // Simulate network latency
      catchError(this.handleError)
    );
  }

  /**
   * Get a service request by ID
   * @param id Service request ID
   * @returns Observable of ServiceRequest
   */
  getById(id: string): Observable<ServiceRequest> {
    // In a real app:
    // return this.http.get<ServiceRequest>(`${this.apiUrl}/${id}`)
    //   .pipe(
    //     catchError(this.handleError)
    //   );
    
    // For demo:
    const request = this.mockData.find(req => req.id === id);
    return request 
      ? of(request).pipe(delay(800))
      : throwError(() => new Error(`Service request with ID ${id} not found`));
  }

  /**
   * Create a new service request
   * @param request Service request to create
   * @returns Observable of created ServiceRequest
   */
  create(request: Omit<ServiceRequest, 'id' | 'dateCreated'>): Observable<ServiceRequest> {
    // In a real app:
    // return this.http.post<ServiceRequest>(this.apiUrl, request)
    //   .pipe(
    //     catchError(this.handleError)
    //   );
    
    // For demo:
    const newRequest: ServiceRequest = {
      ...request,
      id: `SR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      dateCreated: new Date()
    };
    
    return of(newRequest).pipe(delay(1200));
  }

  /**
   * Update an existing service request
   * @param id Service request ID
   * @param request Updated service request data
   * @returns Observable of updated ServiceRequest
   */
  update(id: string, request: Partial<ServiceRequest>): Observable<ServiceRequest> {
    // In a real app:
    // return this.http.patch<ServiceRequest>(`${this.apiUrl}/${id}`, request)
    //   .pipe(
    //     catchError(this.handleError)
    //   );
    
    // For demo:
    const index = this.mockData.findIndex(req => req.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Service request with ID ${id} not found`));
    }
    
    const updatedRequest = {
      ...this.mockData[index],
      ...request
    };
    
    return of(updatedRequest).pipe(delay(1000));
  }

  /**
   * Delete a service request
   * @param id Service request ID
   * @returns Observable of void
   */
  delete(id: string): Observable<void> {
    // In a real app:
    // return this.http.delete<void>(`${this.apiUrl}/${id}`)
    //   .pipe(
    //     catchError(this.handleError)
    //   );
    
    // For demo:
    const index = this.mockData.findIndex(req => req.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Service request with ID ${id} not found`));
    }
    
    return of(undefined).pipe(delay(1000));
  }

  /**
   * Handle HTTP errors
   * @param error Error object
   * @returns Observable that errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Repository error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}