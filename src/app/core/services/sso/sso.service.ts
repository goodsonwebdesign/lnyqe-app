import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DomainMapping, ProviderType } from '../../models/identity-provider.model';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../store/actions/auth.actions';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SsoService {
  private http = inject(HttpClient);
  private store = inject(Store);

  // Cache for domain mappings
  private domainMappingsCache: Map<string, DomainMapping> = new Map();

  // Sample domain mappings for development/testing
  // In production, these would be fetched from an API
  private readonly sampleDomainMappings: DomainMapping[] = [
    {
      domain: 'example.com',
      organizationId: 'org_example123',
      connectionName: 'Example-Corp-SSO',
      providerType: ProviderType.SAML,
      logoUrl: 'https://example.com/logo.png',
      displayName: 'Example Corporation',
    },
    {
      domain: 'enterprise.co',
      organizationId: 'org_enterprise456',
      connectionName: 'Enterprise-SSO',
      providerType: ProviderType.AZURE_AD,
      logoUrl: 'https://enterprise.co/logo.png',
      displayName: 'Enterprise Co.',
    },
  ];

  /**
   * Check if a domain is configured for SSO
   * @param domain The email domain to check
   * @returns Observable that resolves to the domain mapping if found
   */
  checkDomainForSso(domain: string): Observable<DomainMapping | null> {
    // Check cache first
    if (this.domainMappingsCache.has(domain)) {
      return of(this.domainMappingsCache.get(domain) || null);
    }

    // In a real implementation, this would be an API call
    // For now, we'll simulate it using the sample data
    if (environment.production) {
      // In production, call the API to get domain mappings
      return this.http.get<DomainMapping>(`${environment.apiUrl}/sso/domains/${domain}`).pipe(
        tap((mapping) => {
          // Cache the result
          if (mapping) {
            this.domainMappingsCache.set(domain, mapping);
          }
        }),
        catchError((error) => {
          console.error('Error checking domain for SSO:', error);
          return of(null);
        }),
      );
    } else {
      // In development, use the sample data
      // Simulate network delay
      return of(this.sampleDomainMappings.find((m) => m.domain === domain) || null).pipe(
        tap((mapping) => {
          // Cache the result
          if (mapping) {
            this.domainMappingsCache.set(domain, mapping);

            // Update the store with organization information
            this.store.dispatch(
              AuthActions.setOrganization({
                organizationId: mapping.organizationId,
              }),
            );
            this.store.dispatch(
              AuthActions.setEnterpriseSSOEnabled({
                enabled: true,
              }),
            );
          }
        }),
      );
    }
  }

  /**
   * Extract the domain from an email address
   * @param email The email address
   * @returns The domain portion of the email
   */
  extractDomainFromEmail(email: string): string {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email format');
    }
    return email.split('@')[1].toLowerCase();
  }

  /**
   * Prepare the app for SSO login with the specified organization
   * @param organizationId The organization ID for SSO
   */
  prepareForSsoLogin(organizationId: string): void {
    this.store.dispatch(AuthActions.setOrganization({ organizationId }));
    this.store.dispatch(AuthActions.setEnterpriseSSOEnabled({ enabled: true }));
  }

  /**
   * Reset SSO state when returning to regular authentication
   */
  resetSsoState(): void {
    this.store.dispatch(AuthActions.setOrganization({ organizationId: '' }));
    this.store.dispatch(AuthActions.setEnterpriseSSOEnabled({ enabled: false }));
  }
}
