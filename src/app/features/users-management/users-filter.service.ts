import { Injectable } from '@angular/core';
import { User } from '../../core/models/user.model';
import { UserFilters } from './users-management.types';
import { filterUsers } from '../../shared/utils/filter-users';

@Injectable({ providedIn: 'root' })
export class UsersFilterService {
  applyFilters(users: User[], filters: UserFilters): User[] {
    return filterUsers(users, filters);
  }
}
