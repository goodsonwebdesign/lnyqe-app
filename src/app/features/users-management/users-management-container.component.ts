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
import { UsersManagementComponent } from './users-management.component';

@Component({
  selector: 'app-users-management-container',
  standalone: true,
  template: `
    <app-users-management
      [filterForm]="filterForm"
      [users]="(filteredUsers$ | async) || []"
      [isLoading]="(isLoading$ | async) || false"
      [error]="error$ | async"
      (addUser)="onAddUser()"
      (editUser)="onEditUser($event)"
      (deleteUser)="onDeleteUser($event)"
      (viewProfile)="onViewProfile($event)"
      (filterChange)="onFilterChange()"
    ></app-users-management>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, UsersManagementComponent],
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

  onAddUser() { /* open modal or dispatch action */ }
  onEditUser(user: UserView) { /* open modal or dispatch action */ }
  onDeleteUser(user: UserView) { /* confirm and dispatch action */ }
  onViewProfile(user: UserView) { /* navigate or open profile */ }
  onFilterChange() { /* optional: handle filter change */ }
}
