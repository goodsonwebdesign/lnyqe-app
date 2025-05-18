import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ServiceRequest } from '../service-requests.types';
import { ServiceRequestAdapter } from '../adapters/service-request.adapter';
import { environment } from '../../../../environments/environment';

/**
 * Repository for handling service request data operations
 * Implements the Repository pattern for data access
 */
@Injectable({
  providedIn: 'root'
})
export class ServiceRequestRepository {
  private apiUrl = `${environment.apiUrl}/service-requests`;

  constructor(
    private http: HttpClient,
    private adapter: ServiceRequestAdapter
  ) {}

  /**
   * Get all service requests
   * @returns An observable of ServiceRequest array
   */
  getAll(): Observable<ServiceRequest[]> {
    return this.http.get<any[]>(`${this.apiUrl}`).pipe(
      map(response => this.adapter.adaptFromApi(response)),
      catchError(error => {
        console.error('Error fetching service requests', error);
        return of([]);
      })
    );
  }

  /**
   * Get a service request by ID
   * @param id The service request ID
   * @returns An observable of a single ServiceRequest
   */
  getById(id: string): Observable<ServiceRequest | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.adapter.adaptSingleItem(response)),
      catchError(error => {
        console.error(`Error fetching service request with ID ${id}`, error);
        return of(null);
      })
    );
  }

  /**
   * Create a new service request
   * @param request The service request to create
   * @returns An observable of the created ServiceRequest
   */
  create(request: ServiceRequest): Observable<ServiceRequest> {
    const apiRequest = this.adapter.adaptToApi(request);
    return this.http.post<any>(`${this.apiUrl}`, apiRequest).pipe(
      map(response => this.adapter.adaptSingleItem(response)),
      catchError(error => {
        console.error('Error creating service request', error);
        throw error;
      })
    );
  }

  /**
   * Update an existing service request
   * @param request The service request to update
   * @returns An observable of the updated ServiceRequest
   */
  update(request: ServiceRequest): Observable<ServiceRequest> {
    const apiRequest = this.adapter.adaptToApi(request);
    return this.http.put<any>(`${this.apiUrl}/${request.id}`, apiRequest).pipe(
      map(response => this.adapter.adaptSingleItem(response)),
      catchError(error => {
        console.error(`Error updating service request with ID ${request.id}`, error);
        throw error;
      })
    );
  }

  /**
   * Delete a service request
   * @param id The ID of the service request to delete
   * @returns An observable of the operation success
   */
  delete(id: string): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error deleting service request with ID ${id}`, error);
        return of(false);
      })
    );
  }
}