export interface UserFilters {
  search?: string | null;
  role?: string | null;
  status?: string | null;
  department?: string | null;
  sortBy?: 'name' | null;
}
