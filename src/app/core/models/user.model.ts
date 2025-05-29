// User roles enumeration
export enum UserRole {
  ADMIN = 'admin',
  FACILITY_MANAGER = 'facility_manager',
  STAFF = 'staff',
  GUEST = 'guest',
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: string;
  department?: string;
  status: string;
  created_at: string;
  emailVerified?: boolean;
  lastLogin?: string;
  updatedAt?: string;
  jobTitle?: string;
  location?: string;
  employeeId?: string;
  organizationId?: string;
  usesSSO?: boolean;
}

export interface UserView {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  department?: string;
  jobTitle?: string;
  location?: string;
  created_at?: string;
  updatedAt?: string;
}

export function transformUserToViewModel(user: User): UserView {
  return {
    id: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    avatar: user.avatar,
    role: user.role?.toLowerCase() || 'guest',
    status: (user.status?.toLowerCase() || 'pending') as 'active' | 'inactive' | 'pending',
    lastLogin: user.lastLogin,
    department: user.department,
    jobTitle: user.jobTitle,
    location: user.location,
    created_at: user.created_at,
    updatedAt: user.updatedAt,
  };
}

export function transformViewModelToUser(view: Partial<UserView>): Partial<User> {
  if (!view) return {};

  return {
    id: view.id,
    first_name: view.first_name,
    last_name: view.last_name,
    email: view.email,
    avatar: view.avatar,
    role: view.role,
    status: view.status,
    department: view.department,
    jobTitle: view.jobTitle,
    location: view.location,
    created_at: view.created_at,
    updatedAt: view.updatedAt,
  };
}
