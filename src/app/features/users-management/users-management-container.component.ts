import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { combineLatest, Subject } from 'rxjs';
import { map, debounceTime, takeUntil, startWith, take } from 'rxjs/operators';
import { UserFilters } from './users-management.types';
import { UsersFilterService } from './users-filter.service';
import { UserView } from '../../core/models/user.model';
import { Store } from '@ngrx/store';
import { UserActions } from '../../store/actions/user.actions';
import { selectUserViews, selectUsersError, selectUsersLoading, selectUserLastLoaded } from '../../store/selectors/user.selectors';
import { UsersManagementComponent } from './users-management.component';

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
    ></app-users-management>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, UsersManagementComponent],
})
export class UsersManagementContainerComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private usersFilterService = inject(UsersFilterService);
  Math = Math;

  filterForm: FormGroup = this.fb.group<UserFilters>({
    search: '',
    role: '',
    status: '',
    sortBy: 'name',
  });

  private destroy$ = new Subject<void>();

  users$ = this.store.select(selectUserViews);
  loading$ = this.store.select(selectUsersLoading);
  error$ = this.store.select(selectUsersError);
  lastLoaded$ = this.store.select(selectUserLastLoaded);

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



  trackByUserId(_index: number, user: UserView): number {
    return user.id;
  }

  addUser(): void {
    // TODO: Implement add user functionality

  }

  editUser(user: UserView): void {
    // TODO: Implement edit user functionality
    console.log('Editing user:', user);
  }

  deleteUser(user: UserView): void {
    if (confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      this.store.dispatch(UserActions.deleteUser({ id: user.id }));
    }
  }
}
