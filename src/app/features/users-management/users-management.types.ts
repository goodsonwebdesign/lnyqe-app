import { User } from '../../core/models/user.model';

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

export interface UserFilters {
  search: string;
  role: string;
  status: string;
  sortBy: string;
}

export interface UsersManagementViewModel {
  users: User[];
  loading: boolean;
  error: any | null;
}
