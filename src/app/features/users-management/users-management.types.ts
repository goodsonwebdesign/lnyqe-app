import { UserView } from '../../core/models/user.model';

export type { UserView };  // Use 'export type' when re-exporting types with isolatedModules enabled

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  department?: string;
  sortBy?: string;
}
