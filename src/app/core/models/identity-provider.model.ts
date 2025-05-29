/**
 * Identity Provider model
 *
 * Used to track different authentication methods for a user
 * This supports scenarios where a user may authenticate through:
 * - Enterprise SSO (Okta, Azure AD, etc.)
 * - Social logins (Google, GitHub, etc.)
 * - Email/password
 */
export interface IdentityProvider {
  id: string; // Primary key for the identity
  userId: string; // Foreign key to User
  providerType: ProviderType; // Type of identity provider
  providerId: string; // External ID from the provider
  providerUserId: string; // User ID in the provider's system

  // Provider-specific data
  email?: string; // Email from this provider
  displayName?: string; // Display name from this provider
  picture?: string; // Profile picture from this provider

  // Provider connection data
  connectionName: string; // Name of the connection (e.g., 'example-corp-sso')
  connectionDomain?: string; // Domain of the connection (e.g., 'example.com')

  // Metadata
  createdAt: Date; // When this identity was first linked
  updatedAt: Date; // When this identity was last updated
  lastUsed?: Date; // When this identity was last used to login

  // Enterprise SSO-specific data
  isEnterprise: boolean; // Whether this is an enterprise connection
  organizationId?: string; // ID of the associated organization
  organizationName?: string; // Name of the associated organization
}

/**
 * Types of identity providers supported
 */
export enum ProviderType {
  AUTH0 = 'auth0', // Regular username/password
  GOOGLE = 'google', // Google social login
  MICROSOFT = 'microsoft', // Microsoft account
  GITHUB = 'github', // GitHub account
  OKTA = 'okta', // Okta SSO
  AZURE_AD = 'azure_ad', // Azure Active Directory
  SAML = 'saml', // Generic SAML provider
  OIDC = 'oidc', // Generic OpenID Connect provider
}

/**
 * Mapping domains to their identity providers
 * Used for automatic SSO routing
 */
export interface DomainMapping {
  domain: string; // Email domain (e.g., 'example.com')
  organizationId: string; // Associated Auth0 organization ID
  connectionName: string; // Auth0 connection name
  providerType: ProviderType; // Type of identity provider
  logoUrl?: string; // URL for the organization's logo
  displayName: string; // Organization display name
}
