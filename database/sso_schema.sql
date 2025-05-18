-- SSO Database Schema for LNYQE Application
-- This schema provides the database structure needed to support SSO functionality
-- with proper user, organization, and identity provider tracking.

-- Organizations table
-- Stores information about organizations that use SSO
CREATE TABLE organizations (
    id VARCHAR(50) PRIMARY KEY,              -- Organization ID from Auth0 (e.g., org_12345)
    name VARCHAR(100) NOT NULL,              -- Organization name
    display_name VARCHAR(100) NOT NULL,      -- Display name for the organization
    logo_url VARCHAR(255),                   -- URL to the organization's logo
    primary_domain VARCHAR(100),             -- Primary domain for the organization
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB                           -- Additional organization metadata
);

-- Users table
-- Core user data including SSO-related fields
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,              -- User ID from Auth0 (e.g., auth0|12345)
    email VARCHAR(255) NOT NULL UNIQUE,      -- User's email address
    first_name VARCHAR(100),                 -- First name
    last_name VARCHAR(100),                  -- Last name
    full_name VARCHAR(200),                  -- Full name (may be computed)
    picture_url VARCHAR(255),                -- Profile picture URL
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    organization_id VARCHAR(50),             -- Foreign key to organizations
    uses_sso BOOLEAN NOT NULL DEFAULT FALSE, -- Whether user authenticates via SSO
    role VARCHAR(50) NOT NULL,               -- User role (admin, facility_manager, staff, guest)
    department VARCHAR(100),                 -- Department within the organization
    job_title VARCHAR(100),                  -- Job title
    employee_id VARCHAR(50),                 -- Organization's employee ID
    location VARCHAR(100),                   -- Office location
    last_login TIMESTAMP,                    -- Last login timestamp
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,                          -- Additional user metadata (preferences, settings)
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
-- Create index on organization_id for faster lookups
CREATE INDEX idx_users_organization ON users(organization_id);

-- User permissions table
-- For granular permission control beyond basic roles
CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    permission VARCHAR(100) NOT NULL,        -- Permission name
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, permission)             -- Each permission should be unique per user
);

-- Identity providers table
-- Tracks different authentication methods for users
CREATE TABLE identity_providers (
    id VARCHAR(100) PRIMARY KEY,             -- Identity ID (provider_type:provider_user_id)
    user_id VARCHAR(50) NOT NULL,            -- Foreign key to users
    provider_type VARCHAR(20) NOT NULL,      -- auth0, google, microsoft, github, okta, azure_ad, saml, oidc
    provider_id VARCHAR(100) NOT NULL,       -- External provider ID
    provider_user_id VARCHAR(100) NOT NULL,  -- User ID in the provider's system
    email VARCHAR(255),                      -- Email from this provider
    display_name VARCHAR(255),               -- Display name from this provider
    picture_url VARCHAR(255),                -- Profile picture from this provider
    connection_name VARCHAR(100) NOT NULL,   -- Name of the connection
    connection_domain VARCHAR(100),          -- Domain of the connection
    is_enterprise BOOLEAN NOT NULL DEFAULT FALSE, -- Whether this is an enterprise connection
    organization_id VARCHAR(50),             -- Related organization ID
    organization_name VARCHAR(100),          -- Name of the associated organization
    last_used TIMESTAMP,                     -- When this identity was last used
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    UNIQUE (provider_type, provider_user_id) -- Each external identity should be unique
);

-- Domain mappings table
-- Used for automatic SSO routing based on email domains
CREATE TABLE domain_mappings (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(100) NOT NULL UNIQUE,     -- Email domain (e.g., 'example.com')
    organization_id VARCHAR(50) NOT NULL,    -- Foreign key to organizations
    connection_name VARCHAR(100) NOT NULL,   -- Auth0 connection name
    provider_type VARCHAR(20) NOT NULL,      -- Type of identity provider
    logo_url VARCHAR(255),                   -- URL for the organization's logo
    display_name VARCHAR(100) NOT NULL,      -- Organization display name
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create index on domain for faster lookups
CREATE INDEX idx_domain_mappings_domain ON domain_mappings(domain);

-- SSO sessions table
-- For tracking active SSO sessions
CREATE TABLE sso_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    identity_id VARCHAR(100) NOT NULL,       -- Foreign key to identity_providers
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (identity_id) REFERENCES identity_providers(id) ON DELETE CASCADE
);

-- SSO audit log table
-- For security and compliance tracking
CREATE TABLE sso_audit_log (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),                     -- Can be NULL for failed login attempts
    identity_id VARCHAR(100),                -- Can be NULL for failed login attempts
    event_type VARCHAR(50) NOT NULL,         -- login, logout, link_identity, unlink_identity, etc.
    event_status VARCHAR(20) NOT NULL,       -- success, failure, etc.
    ip_address VARCHAR(50),
    user_agent TEXT,
    error_message TEXT,                      -- Error message if event failed
    event_data JSONB,                        -- Additional event data
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on event_type for faster filtering
CREATE INDEX idx_sso_audit_log_event_type ON sso_audit_log(event_type);
-- Create index on user_id for faster lookups
CREATE INDEX idx_sso_audit_log_user_id ON sso_audit_log(user_id);

-- Sample data for testing
-- Organization
INSERT INTO organizations (id, name, display_name, logo_url, primary_domain)
VALUES
    ('org_example123', 'Example Corporation', 'Example Corp', 'https://example.com/logo.png', 'example.com'),
    ('org_enterprise456', 'Enterprise Co', 'Enterprise', 'https://enterprise.co/logo.png', 'enterprise.co');

-- Domain mappings
INSERT INTO domain_mappings (domain, organization_id, connection_name, provider_type, display_name)
VALUES
    ('example.com', 'org_example123', 'Example-Corp-SSO', 'saml', 'Example Corporation'),
    ('enterprise.co', 'org_enterprise456', 'Enterprise-SSO', 'azure_ad', 'Enterprise Co');

-- Functions for timestamp management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE
ON organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_identity_providers_updated_at BEFORE UPDATE
ON identity_providers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_domain_mappings_updated_at BEFORE UPDATE
ON domain_mappings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_sso_sessions_updated_at BEFORE UPDATE
ON sso_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
