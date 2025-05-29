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
import { usersManagementProviders } from './feature.providers';

@Component({
  selector: 'app-users-management-container',
  standalone: true,
  template: `
    <!-- Add your presentational component here when available -->
    <div class="p-4">User Management Container Loaded</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: usersManagementProviders,
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
}
