import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { UserActions } from '../../store/actions/user.actions';
import { selectUserViewModel } from '../../store/selectors/user.selectors';
import { UsersFilterService } from './users-filter.service';
import { UserView } from '../../core/models/user.model';

@Component({
  selector: 'app-users-management-container',
  standalone: true,
  template: `
    <div class="p-4 max-w-6xl mx-auto w-full">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-2">User Management</h1>
        <p class="text-neutral-600 dark:text-neutral-400">Manage, filter and search through all system users.</p>
      </div>

      <!-- Filter Controls -->
      <form [formGroup]="filterForm" class="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Search Input -->
        <div class="lg:col-span-3">
          <input
            type="text"
            formControlName="search"
            placeholder="Search users..."
            class="w-full px-4 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <!-- Role Filter -->
        <div>
          <select
            formControlName="role"
            class="w-full px-4 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <select
            formControlName="status"
            class="w-full px-4 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        
        <!-- Department Filter (Mobile Only) -->
        <div class="lg:hidden">
          <select
            formControlName="department"
            class="w-full px-4 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Departments</option>
            <option value="Operations">Operations</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
      </form>

      <!-- Action Button -->
      <div class="flex justify-between items-center mb-6">
        <div class="text-sm text-neutral-500 dark:text-neutral-400" *ngIf="(filteredUsers$ | async) as users">
          {{ users.length }} users found
        </div>
        <button 
          (click)="addUser()"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Add User
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="(isLoading$ | async)" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="(error$ | async) as error" class="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded mb-6">
        <div class="font-bold">Error loading users</div>
        <div>{{ error }}</div>
        <button (click)="loadUsers()" class="mt-2 px-3 py-1 bg-red-200 dark:bg-red-800 rounded">Try Again</button>
      </div>

      <!-- Empty State -->
      <div *ngIf="(filteredUsers$ | async)?.length === 0 && !(isLoading$ | async) && !(error$ | async)" class="text-center py-12 bg-neutral-100 dark:bg-neutral-800/50 rounded">
        <div class="text-xl font-medium mb-2">No users found</div>
        <div class="text-neutral-500 dark:text-neutral-400">Try adjusting your filters or search terms</div>
      </div>

      <!-- Users Table (Desktop) -->
      <div class="hidden md:block overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
        <table class="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead class="bg-neutral-50 dark:bg-neutral-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                User
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                Department
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-700">
            <tr *ngFor="let user of (filteredUsers$ | async); trackBy: trackByUserId" class="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img class="h-10 w-10 rounded-full object-cover" [src]="user.avatar || 'assets/default-avatar.png'" [alt]="user.first_name">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                    <div class="text-sm text-neutral-500 dark:text-neutral-400">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  {{ user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' : 
                    user.role === 'staff' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' : 
                    'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-200' }}">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  {{ user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 
                    user.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' : 
                    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' }}">
                  {{ user.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                {{ user.department }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button (click)="editUser(user)" class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 mr-4">
                  Edit
                </button>
                <button (click)="deleteUser(user)" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile User Cards -->
      <div class="md:hidden space-y-4">
        <div *ngFor="let user of (filteredUsers$ | async); trackBy: trackByUserId" 
             class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 shadow-sm">
          <div class="flex items-center mb-3">
            <img [src]="user.avatar || 'assets/default-avatar.png'" [alt]="user.first_name" 
                 class="h-12 w-12 rounded-full object-cover mr-3">
            <div>
              <div class="font-medium">{{ user.first_name }} {{ user.last_name }}</div>
              <div class="text-sm text-neutral-500 dark:text-neutral-400">{{ user.email }}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div>
              <div class="text-neutral-500 dark:text-neutral-400">Role</div>
              <div>{{ user.role }}</div>
            </div>
            <div>
              <div class="text-neutral-500 dark:text-neutral-400">Status</div>
              <div>{{ user.status }}</div>
            </div>
            <div>
              <div class="text-neutral-500 dark:text-neutral-400">Department</div>
              <div>{{ user.department }}</div>
            </div>
            <div>
              <div class="text-neutral-500 dark:text-neutral-400">Location</div>
              <div>{{ user.location || 'N/A' }}</div>
            </div>
          </div>
          <div class="flex space-x-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <button (click)="editUser(user)" 
                    class="flex-1 py-2 text-center text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded">
              Edit
            </button>
            <button (click)="deleteUser(user)"
                    class="flex-1 py-2 text-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class UsersManagementContainerComponent {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private usersFilterService = inject(UsersFilterService);

  filterForm: FormGroup = this.fb.group({
    search: [''],
    role: [''],
    status: [''],
    department: [''],
    sortBy: ['name'],
  });

  filteredUsers$: Observable<UserView[]> = combineLatest([
    this.store.select(selectUserViewModel).pipe(map(vm => vm.users)),
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.value), debounceTime(300), distinctUntilChanged()),
  ]).pipe(
    map(([users, filters]) => this.usersFilterService.applyFilters(users, filters)),
  );

  isLoading$ = this.store.select(selectUserViewModel).pipe(map(vm => vm.loading));
  error$ = this.store.select(selectUserViewModel).pipe(map(vm => vm.error));

  constructor() {
    this.store.dispatch(UserActions.loadUsers());
  }

  trackByUserId(index: number, user: UserView): number {
    return user.id;
  }

  loadUsers(): void {
    this.store.dispatch(UserActions.loadUsers());
  }

  addUser(): void {
    // TODO: Implement add user functionality
    console.log('Add user clicked');
  }

  editUser(user: UserView): void {
    // TODO: Implement edit user functionality
    console.log('Edit user clicked:', user);
  }

  deleteUser(user: UserView): void {
    if (confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      this.store.dispatch(UserActions.deleteUser({ id: user.id }));
    }
  }
}
