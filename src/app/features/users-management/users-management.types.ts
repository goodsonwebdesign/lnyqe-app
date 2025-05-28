import { User, UserView } from '../../core/models/user.model';

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
