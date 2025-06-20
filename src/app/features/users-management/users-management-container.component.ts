import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, debounceTime, takeUntil, startWith } from 'rxjs/operators';
import { UsersService } from '../../core/services/users/users.service';
import { UserView } from '../../core/models/user.model';

@Component({
  selector: 'app-users-management-container',
  standalone: true,
  templateUrl: './users-management-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class UsersManagementContainerComponent implements OnInit, OnDestroy {
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  Math = Math;

  filterForm: FormGroup = this.fb.group({
    search: [''],
    attribute: [''], // Combined role/department
    status: [''],
    sortBy: ['name'],
  });

  private destroy$ = new Subject<void>();

  users$: Observable<UserView[]> = this.usersService.loadAllUsers();
  isLoading = false;
  error: any = null;

  filteredUsers$: Observable<UserView[]> = combineLatest([
    this.users$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.value), debounceTime(200))
  ]).pipe(
    map(([users, filters]) => this.applyFilters(users, filters))
  );

  ngOnInit(): void {
    // Optionally, handle loading/error states here if needed
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
    // Removed status filter as 'status' no longer exists on UserView
    // if (filters.status) {
    //   filtered = filtered.filter(u => u.status === filters.status);
    // }
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
    console.log('Add user clicked');
  }

  editUser(user: UserView): void {
    // TODO: Implement edit user functionality
    console.log('Edit user clicked:', user);
  }

  deleteUser(user: UserView): void {
    if (confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          // Optionally, reload users or show a notification
        },
        error: err => {
          this.error = err;
        }
      });
    }
  }
}
