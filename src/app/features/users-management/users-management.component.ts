import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { selectUserViewModel } from '../../store/selectors/user.selectors';
import { UI_COMPONENTS } from '../../shared/components/ui';
import { UsersFilterService } from './users-filter.service';
import { UserView, UserFilters, UsersManagementViewModel } from './users-management.types';
import { UserActions } from '../../store/actions/user.actions';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...UI_COMPONENTS],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">User Management</h1>
        <app-button variant="primary" (click)="onAddUser()">
          <app-icon name="mdi:account-plus" size="sm" className="mr-2"></app-icon>
          Add User
        </app-button>
      </div>

      <!-- Search and Filter Bar -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
        <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              formControlName="search"
              placeholder="Search users..."
              class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:text-white"
            >
          </div>
          <div>
            <select
              formControlName="role"
              class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="facility_manager">Facility Manager</option>
              <option value="staff">Staff</option>
              <option value="guest">Guest</option>
            </select>
          </div>
          <div>
            <select
              formControlName="status"
              class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <select
              formControlName="sortBy"
              class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="role">Sort by Role</option>
              <option value="lastLogin">Sort by Last Login</option>
            </select>
          </div>
        </form>
      </div>

      <!-- Users Table -->
      <ng-container *ngIf="!(isLoading$ | async) && !(error$ | async); else loadingOrError">
        <div class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead class="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                <tr *ngFor="let user of filteredUsers$ | async" class="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img *ngIf="user.picture" [src]="user.picture" [alt]="user.name" class="h-10 w-10 rounded-full">
                        <div *ngIf="!user.picture" class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <span class="text-primary-600 dark:text-primary-400 text-sm font-medium">
                            {{ getUserInitials(user) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {{ user.name }}
                        </div>
                        <div class="text-sm text-neutral-500 dark:text-neutral-400">
                          {{ user.email }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-neutral-900 dark:text-neutral-100">{{ user.role | titlecase }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [ngClass]="{
                      'px-2 py-1 text-xs rounded-full': true,
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': user.status === 'active',
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': user.status === 'inactive',
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': user.status === 'pending'
                    }">
                      {{ user.status | titlecase }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {{ user.lastLogin | date:'medium' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <app-button variant="ghost" size="sm" (click)="onEditUser(user)">Edit</app-button>
                    <app-button variant="ghost" size="sm" (click)="onDeleteUser(user)" class="ml-2 text-red-600 dark:text-red-400">
                      Delete
                    </app-button>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr *ngIf="(filteredUsers$ | async)?.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
                    No users found matching your filters
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>

      <!-- Loading or Error State -->
      <ng-template #loadingOrError>
        <div *ngIf="isLoading$ | async" class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <div class="flex justify-center items-center space-x-2">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span class="text-neutral-600 dark:text-neutral-400">Loading users...</span>
          </div>
        </div>

        <div *ngIf="error$ | async as error" class="bg-white dark:bg-neutral-800 rounded-lg border border-red-200 dark:border-red-700 p-6">
          <div class="flex items-center text-red-600 dark:text-red-400">
            <app-icon name="mdi:alert-circle" size="sm" className="mr-2"></app-icon>
            <span>{{ error?.message || 'An error occurred while loading users' }}</span>
          </div>
          <app-button variant="primary" size="sm" class="mt-4" (click)="retryLoad()">
            Retry
          </app-button>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./users-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersManagementComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private usersFilterService = inject(UsersFilterService);
  private destroy$ = new Subject<void>();

  filterForm: FormGroup;
  filteredUsers$: Observable<UserView[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<any>;

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      role: [''],
      status: [''],
      sortBy: ['name']
    });

    // Get the base user view model
    const userViewModel$ = this.store.select(selectUserViewModel);

    // Extract loading and error states
    this.isLoading$ = userViewModel$.pipe(
      map(vm => vm.loading)
    );
    this.error$ = userViewModel$.pipe(
      map(vm => vm.error)
    );

    // Combine users with filter form values to create filtered users stream
    this.filteredUsers$ = combineLatest([
      userViewModel$.pipe(
        map(vm => vm?.users ?? []),  // Handle undefined view model and users
        startWith([])  // Start with empty array while loading
      ),
      this.filterForm.valueChanges.pipe(
        startWith(this.filterForm.value),
        debounceTime(300),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([users, filters]) => this.usersFilterService.applyFilters(users || [], filters || {})),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    // Initial data load is handled by the dashboard component
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserInitials(user: UserView): string {
    if (!user.name) return 'U';
    const parts = user.name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  onAddUser(): void {
    // Will be implemented in a follow-up PR with a proper form modal
    console.log('Create user clicked');
    // For now, create a test user
    const newUser = {
      name: 'New User',
      email: 'newuser@example.com',
      role: 'staff',
      status: 'pending' as const
    };
    this.store.dispatch(UserActions.createUser({ user: newUser }));
  }

  onEditUser(user: UserView): void {
    // Will be implemented in a follow-up PR with a proper form modal
    console.log('Edit user clicked', user);
    const updatedUser = {
      ...user,
      name: `${user.name} (edited)` // For testing purposes
    };
    this.store.dispatch(UserActions.updateUser({ id: user.id, user: updatedUser }));
  }

  onDeleteUser(user: UserView): void {
    // Will be implemented in a follow-up PR with a confirmation modal
    if (confirm('Are you sure you want to delete this user?')) {
      this.store.dispatch(UserActions.deleteUser({ id: user.id }));
    }
  }

  retryLoad(): void {
    this.store.dispatch(UserActions.loadUsers());
  }
}
