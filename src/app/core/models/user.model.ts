// User roles enumeration
export enum UserRole {
  ADMIN = 'admin',
  FACILITY_MANAGER = 'facility_manager',
  STAFF = 'staff',
  GUEST = 'guest',
}

export interface User {
  id: number | string;
  auth0_id: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  last_login: string; // ISO date string
}

export interface UserView {
  id: number; // Enforce number for consistency with service layer
  name?: string; // Added for display
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  email_verified?: boolean;
  role: string; // Role as string, transformation handles specific enum values
  last_login?: string; // Renamed for consistency
  created_at?: string;
  updated_at?: string; // Renamed for consistency
}

export function transformUserToViewModel(user: User): UserView {
  return {
    id: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id, // Normalize ID to number
    name: user.name || `${user.first_name} ${user.last_name}`.trim(), // Use backend name or derive
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    avatar: user.avatar,
    email_verified: user.email_verified,
    role: user.role?.toLowerCase() || 'guest',
    last_login: user.last_login, // Use renamed field
    created_at: user.created_at,
    updated_at: user.updated_at, // Use renamed field
  };
}

export function transformViewModelToUser(view: Partial<UserView>): Partial<User> {
  if (!view) return {};

  const user: Partial<User> = {};

  // Fields that might be updated from a view model
  if (view.id !== undefined) user.id = view.id;
  if (view.first_name !== undefined) user.first_name = view.first_name;
  if (view.last_name !== undefined) user.last_name = view.last_name;
  if (view.email !== undefined) user.email = view.email;
  if (view.avatar !== undefined) user.avatar = view.avatar;
  if (view.email_verified !== undefined) user.email_verified = view.email_verified;
  if (view.role !== undefined) user.role = view.role;

  // If 'name' from UserView is directly editable and should map back to 'name' on User:
  // if (view.name !== undefined) user.name = view.name; 
  // However, 'name' is often derived or comes from backend, not typically set directly if first/last are present.

  // Fields like auth0_id, created_at, updated_at, last_login are generally not set from a view model.
  
  return user;
}
