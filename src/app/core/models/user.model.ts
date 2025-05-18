/**
 * User model representing the core user data
 * This model is optimized for SSO integration
 */
export interface User {
  // Core user data
  id: string;              // Primary key, typically from Auth0
  email: string;           // Primary email address
  name?: string;           // Full name
  firstName?: string;      // First name
  lastName?: string;       // Last name
  picture?: string;        // Profile picture URL

  // Authentication data
  emailVerified: boolean;  // Whether the email has been verified
  lastLogin?: Date;        // Last login timestamp
  createdAt: Date;         // When the user was first created
  updatedAt: Date;         // When the user record was last updated

  // SSO-specific data
  organizationId?: string; // ID of the organization the user belongs to
  usesSSO: boolean;        // Whether the user authenticates via SSO

  // Application-specific data
  role: UserRole;          // User's role in the system
  permissions?: string[];  // Specific permissions granted to the user
  metadata?: any;          // Additional user metadata (preferences, settings)

  // Enterprise data
  department?: string;     // User's department
  jobTitle?: string;       // User's job title
  employeeId?: string;     // Organization's employee ID
  location?: string;       // User's office location
}

/**
 * User roles for the LNYQE application
 */
export enum UserRole {
  ADMIN = 'admin',
  FACILITY_MANAGER = 'facility_manager',
  STAFF = 'staff',
  GUEST = 'guest'
}
