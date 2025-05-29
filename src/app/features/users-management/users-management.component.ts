import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { UserView } from './users-management.types';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScrollingModule],
  template: `
    <div class="container max-w-5xl mx-auto px-4 py-6 w-full" data-testid="users-management-container">
      <!-- Header with title and add button -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 class="text-xl font-bold text-neutral-800 dark:text-neutral-100">User Management</h1>
        <button 
          type="button" 
          (click)="addUser.emit()" 
          class="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation" 
          data-testid="add-user-button"
          aria-label="Add user">
          <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      <!-- Filter form -->
      <form 
        [formGroup]="filterForm" 
        (ngSubmit)="filterChange.emit()"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4"
        data-testid="user-filter-form"
        aria-label="Filter users">
        <div class="col-span-1 sm:col-span-2">
          <input 
            formControlName="search" 
            type="text" 
            placeholder="Search users..." 
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 text-sm"
            data-testid="search-input"
            aria-label="Search users" />
        </div>
        <select 
          formControlName="role" 
          class="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 text-sm"
          data-testid="role-filter"
          aria-label="Filter by role">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="guest">Guest</option>
        </select>
        <select 
          formControlName="status" 
          class="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 text-sm"
          data-testid="status-filter"
          aria-label="Filter by status">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
        <select 
          formControlName="department" 
          class="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 text-sm"
          data-testid="department-filter"
          aria-label="Filter by department">
          <option value="">All Departments</option>
          <option value="Operations">Operations</option>
          <option value="Engineering">Engineering</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
        </select>
      </form>

      <!-- Loading, error and empty states -->
      <div *ngIf="isLoading" class="flex justify-center py-8" data-testid="loading-indicator">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
      
      <div *ngIf="error" class="text-center p-4 mb-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg" data-testid="error-message">
        {{ error }}
      </div>
      
      <div *ngIf="users?.length === 0 && !isLoading" class="text-center py-8 text-neutral-500 dark:text-neutral-400" data-testid="empty-state">
        No users found matching your filters.
      </div>

      <!-- User list - Desktop view (table) -->
      <div *ngIf="users && users.length > 0 && !isLoading" class="hidden md:block overflow-hidden rounded-lg shadow bg-white dark:bg-neutral-900">
        <table class="min-w-full text-sm">
          <thead class="bg-neutral-100 dark:bg-neutral-800 sticky top-0 z-10">
            <tr>
              <th scope="col" class="px-3 py-2 font-medium text-neutral-700 dark:text-neutral-300">User</th>
              <th scope="col" class="px-3 py-2 font-medium text-neutral-700 dark:text-neutral-300">Email</th>
              <th scope="col" class="px-3 py-2 font-medium text-neutral-700 dark:text-neutral-300">Role</th>
              <th scope="col" class="px-3 py-2 font-medium text-neutral-700 dark:text-neutral-300">Status</th>
              <th scope="col" class="px-3 py-2 font-medium text-neutral-700 dark:text-neutral-300">Department</th>
              <th scope="col" class="px-3 py-2 font-medium text-neutral-700 dark:text-neutral-300 text-right">Actions</th>
            </tr>
          </thead>
        </table>
        <div class="overflow-y-auto h-[calc(100vh-360px)] min-h-[300px]">
          <cdk-virtual-scroll-viewport 
            [itemSize]="48" 
            class="h-full"
            data-testid="user-virtual-list">
            <table class="min-w-full text-sm">
              <tbody>
                <tr 
                  *cdkVirtualFor="let user of users; trackBy: trackByUserId; templateCacheSize: 0" 
                  class="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  [attr.data-testid]="'user-row-' + user.id">
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-2">
                      <img 
                        [src]="user.avatar || 'assets/default-avatar.png'" 
                        [alt]="'Avatar of ' + user.first_name + ' ' + user.last_name" 
                        class="w-8 h-8 rounded-full object-cover bg-neutral-200 dark:bg-neutral-700" 
                        loading="lazy"
                        onError="this.src='assets/default-avatar.png'" />
                      <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ user.first_name }} {{ user.last_name }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-2 text-neutral-700 dark:text-neutral-300">{{ user.email }}</td>
                  <td class="px-3 py-2">
                    <span 
                      [ngClass]="{
                        'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300': user.role === 'admin',
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300': user.role === 'staff',
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300': user.role === 'guest'
                      }"
                      class="px-2 py-1 text-xs font-medium rounded-full capitalize">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-3 py-2">
                    <span
                      [ngClass]="{
                        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300': user.status === 'active',
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300': user.status === 'pending',
                        'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300': user.status === 'inactive'
                      }"
                      class="px-2 py-1 text-xs font-medium rounded-full capitalize">
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-neutral-700 dark:text-neutral-300">{{ user.department }}</td>
                  <td class="px-3 py-2 text-right">
                    <div class="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        (click)="viewProfile.emit(user)" 
                        class="p-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 touch-manipulation"
                        [attr.data-testid]="'view-user-' + user.id"
                        aria-label="View user profile">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        (click)="editUser.emit(user)" 
                        class="p-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 touch-manipulation"
                        [attr.data-testid]="'edit-user-' + user.id"
                        aria-label="Edit user">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        (click)="deleteUser.emit(user)" 
                        class="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 touch-manipulation"
                        [attr.data-testid]="'delete-user-' + user.id"
                        aria-label="Delete user">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </cdk-virtual-scroll-viewport>
        </div>
      </div>

      <!-- User list - Mobile view (cards) -->
      <div *ngIf="users && users.length > 0 && !isLoading" class="md:hidden space-y-3">
        <div class="overflow-y-auto h-[calc(100vh-360px)] min-h-[300px]">
          <cdk-virtual-scroll-viewport
            [itemSize]="115"
            class="h-full"
            data-testid="user-virtual-list-mobile">
            <div 
              *cdkVirtualFor="let user of users; trackBy: trackByUserId; templateCacheSize: 0" 
              class="p-3 mb-3 bg-white dark:bg-neutral-900 rounded-lg shadow border border-neutral-200 dark:border-neutral-700"
              [attr.data-testid]="'user-card-' + user.id">
              <div class="flex items-center gap-3">
                <img 
                  [src]="user.avatar || 'assets/default-avatar.png'" 
                  [alt]="'Avatar of ' + user.first_name + ' ' + user.last_name" 
                  class="w-10 h-10 rounded-full object-cover bg-neutral-200 dark:bg-neutral-700" 
                  loading="lazy"
                  onError="this.src='assets/default-avatar.png'" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-medium truncate text-neutral-900 dark:text-neutral-100">
                      {{ user.first_name }} {{ user.last_name }}
                    </h3>
                    <div class="flex gap-1">
                      <button 
                        type="button" 
                        (click)="viewProfile.emit(user)" 
                        class="p-1 text-primary-600 touch-manipulation"
                        [attr.data-testid]="'view-mobile-' + user.id"
                        aria-label="View user profile">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        (click)="editUser.emit(user)" 
                        class="p-1 text-amber-600 touch-manipulation"
                        [attr.data-testid]="'edit-mobile-' + user.id"
                        aria-label="Edit user">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        (click)="deleteUser.emit(user)" 
                        class="p-1 text-red-600 touch-manipulation"
                        [attr.data-testid]="'delete-mobile-' + user.id"
                        aria-label="Delete user">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate">{{ user.email }}</p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span 
                      [ngClass]="{
                        'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300': user.role === 'admin',
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300': user.role === 'staff',
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300': user.role === 'guest'
                      }"
                      class="px-2 py-0.5 text-xs font-medium rounded-full capitalize">
                      {{ user.role }}
                    </span>
                    <span
                      [ngClass]="{
                        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300': user.status === 'active',
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300': user.status === 'pending',
                        'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300': user.status === 'inactive'
                      }"
                      class="px-2 py-0.5 text-xs font-medium rounded-full capitalize">
                      {{ user.status }}
                    </span>
                    <span class="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 rounded-full">
                      {{ user.department }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </cdk-virtual-scroll-viewport>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersManagementComponent implements AfterViewInit {
  @Input() users: UserView[] = [];
  @Input() isLoading: boolean = false;
  @Input() error: any = null;
  @Input() filterForm!: FormGroup;
  
  @Output() addUser = new EventEmitter<void>();
  @Output() editUser = new EventEmitter<UserView>();
  @Output() deleteUser = new EventEmitter<UserView>();
  @Output() viewProfile = new EventEmitter<UserView>();
  @Output() filterChange = new EventEmitter<void>();

  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  /**
   * After component view initialization, adjust scroll behavior 
   * for smoother experience
   */
  ngAfterViewInit(): void {
    if (this.viewport) {
      // Increase the rendering buffer size to avoid jumpy scrolling
      const viewportEl = this.viewport.elementRef.nativeElement;
      
      if (viewportEl) {
        // Smooth scrolling behavior for modern browsers
        viewportEl.style.scrollBehavior = 'smooth';
      }
    }
  }

  /**
   * Track users by their ID for optimized rendering
   */
  trackByUserId(index: number, user: UserView) {
    return user.id;
  }
}
