import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
  private domainMappingsCache = new Map<string, DomainMapping>();

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
   * Check if a domain is configured for SSO, updates cache, and dispatches actions.
   * @param domain The email domain to check
   * @returns Observable that resolves to the domain mapping if found
   */
  checkDomainForSso(domain: string): Observable<DomainMapping | null> {
    // Check cache first
    if (this.domainMappingsCache.has(domain)) {
      return of(this.domainMappingsCache.get(domain) || null);
    }

    return this._getDomainMapping(domain).pipe(
      tap((mapping) => {
        if (mapping) {
          // Cache the result for subsequent checks
          this.domainMappingsCache.set(domain, mapping);

          // Update the store with organization information to prepare for SSO
          this.prepareForSsoLogin(mapping.organizationId);
        }
      }),
    );
  }

  /**
   * Extract the domain from an email address
   * @param email The email address
   * @returns The domain portion of the email
   */
  extractDomainFromEmail(email: string): string {
    const atIndex = email?.indexOf('@');
    if (!atIndex || atIndex === -1 || atIndex === email.length - 1) {
      throw new Error(`Invalid email format provided: ${email}`);
    }
    return email.substring(atIndex + 1).toLowerCase();
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

  /**
   * Fetches domain mapping from API (prod) or sample data (dev).
   * @param domain The email domain to check
   */
  private _getDomainMapping(domain: string): Observable<DomainMapping | null> {
    if (environment.production) {
      return this.http.get<DomainMapping>(`${environment.apiUrl}/sso/domains/${domain}`).pipe(
        catchError((error: unknown) => {
          console.error(`Error checking SSO domain ${domain}:`, error);
          return of(null); // Gracefully handle API errors
        }),
      );
    } else {
      return of(this.sampleDomainMappings.find((m) => m.domain === domain) || null);
    }
  }
}
