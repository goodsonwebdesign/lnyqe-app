import { Injectable } from '@angular/core';
import { UserFilters } from './users-management.types';
import { UserView } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersFilterService {
  applyFilters(users: UserView[], filters: UserFilters): UserView[] {
    // Handle undefined users array
    if (!Array.isArray(users)) {
      return [];
    }

    // Create a copy of the array to avoid modifying the original
    let filteredUsers = [...users];

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => {
        const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.toLowerCase();
        return fullName.includes(searchLower) ||
          (user?.email?.toLowerCase() || '').includes(searchLower) ||
          (user?.department?.toLowerCase() || '').includes(searchLower) ||
          (user?.jobTitle?.toLowerCase() || '').includes(searchLower) ||
          (user?.location?.toLowerCase() || '').includes(searchLower);
      });
    }

    // Apply role filter
    if (filters?.role) {
      filteredUsers = filteredUsers.filter(user => user?.role === filters.role);
    }

    // Apply status filter
    if (filters?.status) {
      filteredUsers = filteredUsers.filter(user => user?.status === filters.status);
    }

    // Apply sorting - create another copy for sorting to ensure we're working with a mutable array
    if (filters?.sortBy) {
      return [...filteredUsers].sort((a, b) => {
        switch (filters.sortBy) {
          case 'name':
            const aName = `${a?.first_name || ''} ${a?.last_name || ''}`;
            const bName = `${b?.first_name || ''} ${b?.last_name || ''}`;
            return aName.localeCompare(bName);
          case 'email':
            return (a?.email || '').localeCompare(b?.email || '');
          case 'role':
            return (a?.role || '').localeCompare(b?.role || '');
          case 'lastLogin':
            const aDate = a?.lastLogin ? new Date(a.lastLogin) : new Date(0);
            const bDate = b?.lastLogin ? new Date(b.lastLogin) : new Date(0);
            return bDate.getTime() - aDate.getTime();
          default:
            return 0;
        }
      });
    }

    return filteredUsers;
  }
}
