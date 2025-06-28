import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { combineLatest, Subject } from 'rxjs';
import { map, debounceTime, takeUntil, startWith, take, filter } from 'rxjs/operators';
import { UserFilters } from './users-management.types';
import { UsersFilterService } from './users-filter.service';
import { User } from '../../core/models/user.model';
import { Store } from '@ngrx/store';
import { UserActions } from '../../store/actions/user.actions';
import { selectAllUsers, selectUsersError, selectUsersLoading, selectUserLastLoaded } from '../../store/selectors/user.selectors';
import { selectUser } from '../../store/selectors/auth.selectors';
import { FlyoutService } from '../../core/services/flyout/flyout.service';
import { ThemeService } from '../../core/services/theme.service';
import { UsersManagementComponent } from './users-management.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';

@Component({
  selector: 'app-users-management-container',
  standalone: true,
  template: `
    <app-users-management
      [users]="filteredUsers$ | async"
      [isLoading]="(loading$ | async) ?? false"
      [error]="(error$ | async)?.message ?? null"
      [filterForm]="filterForm"
      (addUser)="addUser()"
      (editUser)="editUser($event)"
      (deleteUser)="deleteUser($event)"
      [isAdmin]="(isAdmin$ | async) ?? false"
    ></app-users-management>

    <!-- Flyout for editing a user, driven by flyoutState$ observable -->
    <ng-container *ngIf="flyoutState$ | async as flyoutState">
      <div *ngIf="flyoutState.isOpen" class="relative z-50" [class.dark]="themeService.isDarkMode()" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <!-- Transparent backdrop -->
        <div class="fixed inset-0 bg-black/30" aria-hidden="true"></div>

        <div class="fixed inset-0 flex justify-end">
          <div
            (appClickOutside)="closeFlyout()"
            class="w-screen max-w-md transform transition duration-300 ease-in-out"
            [class.translate-x-0]="flyoutState.isOpen"
            [class.translate-x-full]="!flyoutState.isOpen"
          >
            <div class="flex h-full flex-col divide-y divide-neutral-200 bg-neutral-50 shadow-xl dark:divide-neutral-800 dark:bg-neutral-900">
              <div class="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                <div class="px-4 sm:px-6">
                  <div class="flex items-start justify-between">
                    <h2 class="text-base font-semibold leading-6 text-neutral-900 dark:text-neutral-100" id="slide-over-title">
                      Edit User Profile
                    </h2>
                    <div class="ml-3 flex h-7 items-center">
                      <button (click)="closeFlyout()" type="button" class="relative rounded-md bg-neutral-50 text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-400">
                        <span class="absolute -inset-2.5"></span>
                        <span class="sr-only">Close panel</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="relative mt-6 flex-1 px-4 sm:px-6">
                  <app-user-edit #userEdit [user]="flyoutState.data ?? null" (userUpdate)="handleUserUpdate($event)" (formClose)="closeFlyout()"></app-user-edit>
                </div>
              </div>
              <div class="flex flex-shrink-0 justify-end px-4 py-4">
                <button (click)="closeFlyout()" type="button" class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700 dark:hover:bg-neutral-700">
                  Cancel
                </button>
                <button
                  (click)="saveChanges()"
                  [disabled]="isSaveDisabled()"
                  type="submit"
                  class="ml-4 inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UsersManagementComponent,
    UserEditComponent,
    ClickOutsideDirective,
  ],
})
export class UsersManagementContainerComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private usersFilterService = inject(UsersFilterService);
  private flyoutService = inject(FlyoutService);
  themeService = inject(ThemeService);
  @ViewChild(UserEditComponent) userEditComponent?: UserEditComponent;

  filterForm: FormGroup = this.fb.group<UserFilters>({
    search: '',
    role: '',
    status: '',
    sortBy: 'name',
  });

  private destroy$ = new Subject<void>();

  users$ = this.store.select(selectAllUsers);
  loading$ = this.store.select(selectUsersLoading);
  error$ = this.store.select(selectUsersError);
  lastLoaded$ = this.store.select(selectUserLastLoaded);
  isAdmin$ = this.store.select(selectUser).pipe(map((user) => user?.role === 'admin'));

  // Reactive state for the flyout, filtered for this component's type
  flyoutState$ = this.flyoutService.getState().pipe(
    filter(state => state.type === 'user-edit' || !state.isOpen),
    map(state => {
      const data = state.type === 'user-edit' ? (state.data as User) : null;
      return { ...state, data };
    }),
    takeUntil(this.destroy$)
  );

  filteredUsers$ = combineLatest([
    this.users$,
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(200)
    ),
  ]).pipe(
    map(([users, filters]) => this.usersFilterService.applyFilters(users, filters)),
    takeUntil(this.destroy$)
  );

  ngOnInit(): void {
    this.lastLoaded$.pipe(take(1)).subscribe(lastLoaded => {
      const cacheTime = 5 * 60 * 1000; // 5 minutes
      if (!lastLoaded || new Date().getTime() - new Date(lastLoaded).getTime() > cacheTime) {
        this.store.dispatch(UserActions.loadUsers());
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addUser(): void {
    // TODO: Implement add user functionality
  }

  editUser(user: User): void {
    this.flyoutService.openFlyout('user-edit', 'right', user);
  }

  handleUserUpdate(event: { id: number; data: Partial<User> }): void {
    this.store.dispatch(UserActions.updateUser({ id: event.id, user: event.data }));
    this.closeFlyout();
  }

  closeFlyout(): void {
    this.flyoutService.closeFlyout();
  }

  deleteUser(user: User): void {
    if (user.id && confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      this.store.dispatch(UserActions.deleteUser({ id: user.id as number }));
    }
  }

  isSaveDisabled(): boolean {
    const form = this.userEditComponent?.userForm;
    if (!form) {
      return true;
    }
    return !form.valid || !form.dirty;
  }

  saveChanges(): void {
    if (this.userEditComponent) {
      this.userEditComponent.onSubmit();
    }
  }
}
