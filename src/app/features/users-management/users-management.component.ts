import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserView } from './users-management.types';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4 max-w-5xl mx-auto w-full">
      <form [formGroup]="filterForm" class="flex flex-col gap-2 sm:flex-row sm:items-center mb-4">
        <input formControlName="search" type="text" placeholder="Search users..." class="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-400 text-sm" />
        <select formControlName="role" class="px-3 py-2 rounded border border-gray-300 text-sm">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="guest">Guest</option>
        </select>
        <select formControlName="status" class="px-3 py-2 rounded border border-gray-300 text-sm">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="disabled">Disabled</option>
        </select>
        <select formControlName="department" class="px-3 py-2 rounded border border-gray-300 text-sm">
          <option value="">All Departments</option>
          <option value="Operations">Operations</option>
          <option value="Engineering">Engineering</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
        </select>
      </form>
      <button type="button" (click)="addUser.emit()" class="mb-4 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring">Add User</button>
      <div *ngIf="isLoading" class="text-center py-8">Loading users...</div>
      <div *ngIf="error" class="text-center text-red-600 py-4">{{ error }}</div>
      <div *ngIf="users?.length === 0 && !isLoading" class="text-center py-8">No users found.</div>
      <div class="overflow-x-auto rounded shadow bg-white dark:bg-neutral-900">
        <table class="min-w-full text-sm text-left">
          <thead class="bg-gray-100 dark:bg-neutral-800">
            <tr>
              <th class="p-2">Avatar</th>
              <th class="p-2">Name</th>
              <th class="p-2">Email</th>
              <th class="p-2">Role</th>
              <th class="p-2">Status</th>
              <th class="p-2">Department</th>
              <th class="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users; trackBy: trackByUserId" class="border-b last:border-b-0">
              <td class="p-2"><img [src]="user.avatar" [alt]="user.first_name + ' ' + user.last_name" class="w-10 h-10 rounded-full object-cover" /></td>
              <td class="p-2">{{ user.first_name }} {{ user.last_name }}</td>
              <td class="p-2">{{ user.email }}</td>
              <td class="p-2 capitalize">{{ user.role }}</td>
              <td class="p-2 capitalize">{{ user.status }}</td>
              <td class="p-2">{{ user.department }}</td>
              <td class="p-2 flex gap-2">
                <button type="button" (click)="viewProfile.emit(user)" class="text-blue-600 hover:underline">View</button>
                <button type="button" (click)="editUser.emit(user)" class="text-yellow-600 hover:underline">Edit</button>
                <button type="button" (click)="deleteUser.emit(user)" class="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersManagementComponent {
  @Input() users: UserView[] = [];
  @Input() isLoading = false;
  @Input() error: any = null;
  @Input() filterForm!: FormGroup;
  @Output() addUser = new EventEmitter<void>();
  @Output() editUser = new EventEmitter<UserView>();
  @Output() deleteUser = new EventEmitter<UserView>();
  @Output() viewProfile = new EventEmitter<UserView>();
  @Output() filterChange = new EventEmitter<void>();

  trackByUserId(index: number, user: UserView) {
    return user.id;
  }
}
