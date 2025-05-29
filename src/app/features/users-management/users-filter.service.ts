import { Injectable } from '@angular/core';
import { UserView } from '../../core/models/user.model';
import { UserFilters } from './users-management.types';

@Injectable({ providedIn: 'root' })
export class UsersFilterService {
  applyFilters(users: UserView[], filters: UserFilters): UserView[] {
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
    if (filters.status) {
      filtered = filtered.filter(u => u.status === filters.status);
    }
    if (filters.department) {
      filtered = filtered.filter(u => u.department === filters.department);
    }
    if (filters.sortBy === 'name') {
      filtered = filtered.slice().sort((a, b) => (a.first_name + a.last_name).localeCompare(b.first_name + b.last_name));
    }
    return filtered;
  }
}
