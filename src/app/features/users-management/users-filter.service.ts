import { Injectable } from '@angular/core';
import { UserView } from '../../core/models/user.model';
import { UserFilters } from './users-management.types';
import { filterUsers } from '../../shared/utils/filter-users';

@Injectable({ providedIn: 'root' })
export class UsersFilterService {
  applyFilters(users: UserView[], filters: UserFilters): UserView[] {
    return filterUsers(users, filters);
  }
}
