import { UserView } from '../../core/models/user.model';

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  department?: string;
  sortBy?: string;
}
