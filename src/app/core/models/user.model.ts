// User roles enumeration
export enum UserRole {
  ADMIN = 'admin',
  FACILITY_MANAGER = 'facility_manager',
  STAFF = 'staff',
  GUEST = 'guest'
}

export interface User {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: string;
  department?: string;
  status: string;
  created_at: string;
  emailVerified?: boolean;
  lastLogin?: Date;
  updatedAt?: Date;
  jobTitle?: string;
  location?: string;
  employeeId?: string;
  organizationId?: string;
  usesSSO?: boolean;
}

export interface UserView {
  id: string;
  name: string;
  email: string;
  picture?: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
  department?: string;
  jobTitle?: string;
}

export function transformUserToViewModel(user: User): UserView {
  return {
    id: user.id.toString(),
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    picture: user.avatar,
    role: user.role?.toLowerCase() || 'guest',
    status: (user.status?.toLowerCase() || 'pending') as 'active' | 'inactive' | 'pending',
    lastLogin: user.lastLogin || (user.created_at ? new Date(user.created_at) : undefined),
    department: user.department,
    jobTitle: user.jobTitle
  };
}

export function transformViewModelToUser(view: Partial<UserView>): Partial<User> {
  if (!view) return {};

  const names = view.name?.split(' ') || ['', ''];
  return {
    id: typeof view.id === 'string' ? parseInt(view.id, 10) : view.id,
    first_name: names[0],
    last_name: names.slice(1).join(' '),
    email: view.email,
    avatar: view.picture,
    role: view.role,
    status: view.status,
    department: view.department,
    jobTitle: view.jobTitle,
    created_at: view.lastLogin?.toISOString()
  };
}


