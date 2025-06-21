import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, debounceTime, takeUntil, startWith } from 'rxjs/operators';
import { UserFilters } from '../../core/models/user-filters.model';
import { UserView } from '../../core/models/user.model';
import { Store } from '@ngrx/store';
import { UserActions } from '../../store/actions/user.actions';
import { selectUserViews, selectUsersError, selectUsersLoading } from '../../store/selectors/user.selectors';

@Component({
  selector: 'app-users-management-container',
  standalone: true,
  templateUrl: './users-management-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class UsersManagementContainerComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  Math = Math;

  filterForm: FormGroup = this.fb.group({
    search: [''],
    attribute: [''], // Combined role/department
    status: [''],
    sortBy: ['name'],
  });

  private destroy$ = new Subject<void>();

  users$!: Observable<UserView[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<any>;
  filteredUsers$!: Observable<UserView[]>;

  ngOnInit(): void {
    this.users$ = this.store.select(selectUserViews);
    this.loading$ = this.store.select(selectUsersLoading);
    this.error$ = this.store.select(selectUsersError);

    this.filteredUsers$ = combineLatest([
      this.users$,
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value), debounceTime(200))
    ]).pipe(
      map(([users, filters]) => this.applyFilters(users, filters)),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters(users: UserView[], filters: any): UserView[] {
    let filtered = users;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(u =>
        (u.first_name + ' ' + u.last_name).toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }
    if (filters.attribute) {
      const attr = filters.attribute;
      filtered = filtered.filter(u => u.role === attr);
    }
    if (filters.sortBy === 'name') {
      filtered = filtered.slice().sort((a, b) => (a.first_name + a.last_name).localeCompare(b.first_name + b.last_name));
    }
    return filtered;
  }

  trackByUserId(index: number, user: UserView): number {
    return user.id;
  }

  addUser(): void {
    // TODO: Implement add user functionality

  }

  editUser(user: UserView): void {
    // TODO: Implement edit user functionality

  }

  deleteUser(user: UserView): void {
    if (confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      this.store.dispatch(UserActions.deleteUser({ id: user.id }));
    }
  }
}
