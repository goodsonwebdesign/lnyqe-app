import { User } from '../../core/models/user.model';
import { UserFilters } from '../../features/users-management/users-management.types';

export function filterUsers(users: User[], filters: UserFilters): User[] {
  let filtered = users;
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(u =>
      u.first_name.toLowerCase().includes(search) ||
      u.last_name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  }
  if (filters.role) {
    filtered = filtered.filter(u => u.role === filters.role);
  }

  if (filters.sortBy === 'name') {
    filtered = filtered.slice().sort((a, b) => (a.first_name + a.last_name).localeCompare(b.first_name + b.last_name));
  }
  return filtered;
}
