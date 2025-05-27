import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UI_COMPONENTS } from '../../shared/components/ui';
import { AuthService } from '../../core/services/auth/auth.service';
import {
  ActionItem,
  StatCard,
  Task,
  ScheduleItem,
  Notification,
  SystemStatus,
  SectionType
} from './dashboard.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ...UI_COMPONENTS
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  // Services
  private authService = inject(AuthService);

  // Input properties
  @Input() user: any = null;
  @Input() userRole: string = 'admin';
  @Input() activeSection: SectionType = 'overview';
  @Input() quickActions: ActionItem[] = [];
  @Input() adminActions: ActionItem[] = [];
  @Input() statCards: StatCard[] = [];
  @Input() tasks: Task[] = [];
  @Input() scheduleItems: ScheduleItem[] = [];
  @Input() notifications: Notification[] = [];
  @Input() systemStatuses: SystemStatus[] = [];

  // Output events
  @Output() sectionChange = new EventEmitter<SectionType>();
  @Output() createTaskAction = new EventEmitter<void>();
  @Output() scheduleEventAction = new EventEmitter<void>();
  @Output() reportIssueAction = new EventEmitter<void>();
  @Output() runReportsAction = new EventEmitter<void>();
  @Output() addUserAction = new EventEmitter<void>();
  @Output() systemSettingsAction = new EventEmitter<void>();
  @Output() facilityManagementAction = new EventEmitter<void>();
  @Output() viewTasksAction = new EventEmitter<void>();
  @Output() viewAlertsAction = new EventEmitter<void>();
  @Output() viewMessagesAction = new EventEmitter<void>();
  @Output() setViewAction = new EventEmitter<string>();
  @Output() manageRolesAction = new EventEmitter<void>();
  @Output() budgetTrackingAction = new EventEmitter<void>();
  @Output() assignTasksAction = new EventEmitter<void>();
  @Output() manageTaskStatusAction = new EventEmitter<void>();
  @Output() scheduleTaskAction = new EventEmitter<void>();
  @Output() setTaskPriorityAction = new EventEmitter<void>();
  @Output() manageUsersAction = new EventEmitter<void>();

  // Constants for section values to ensure AOT compiler understands them
  readonly SECTION_OVERVIEW: SectionType = 'overview';
  readonly SECTION_TASKS: SectionType = 'tasks';
  readonly SECTION_SCHEDULE: SectionType = 'schedule';
  readonly SECTION_ADMIN: SectionType = 'admin';

  // Cache for expensive computations
  private statusClassCache = new Map<string, string>();
  private notificationIconCache = new Map<string, string>();
  private notificationIconBgCache = new Map<string, string>();
  private notificationIconColorCache = new Map<string, string>();

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    // Pre-cache common status classes and icons for better performance
    this.precacheCommonValues();

    // Optimize animation frames for better performance on mobile devices
    this.optimizeForMobile();
  }

  /**
   * Method to test API token generation
   * This will help diagnose if Auth0 is properly configured for your API audience
   */
  async testApiToken(): Promise<void> {
    console.log('Testing API token generation...');
    try {
      // Use our test method to check if Auth0 can issue tokens with the correct audience
      await this.authService.testApiTokenRequest();
      console.log('API token test completed - check console for details');
    } catch (error) {
      console.error('API token test failed:', error);
    }
  }

  // Methods to handle section changes
  setActiveSection(section: SectionType): void {
    // Use NgZone.runOutsideAngular for UI events that don't affect data model
    this.ngZone.runOutsideAngular(() => {
      // Use requestAnimationFrame for smoother UI transitions
      requestAnimationFrame(() => {
        // Then run back inside Angular zone when we need to update the model
        this.ngZone.run(() => {
          this.sectionChange.emit(section);
        });
      });
    });
  }

  // Check if a section is active (for use in template)
  isSectionActive(section: SectionType): boolean {
    return this.activeSection === section;
  }

  // Helper UI methods with memoization for performance
  getStatusClass(status: string): string {
    if (this.statusClassCache.has(status)) {
      return this.statusClassCache.get(status)!;
    }

    let result: string;
    switch (status) {
      case 'urgent':
        result = 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
        break;
      case 'in-progress':
        result = 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
        break;
      case 'pending':
        result = 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
        break;
      case 'completed':
        result = 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
        break;
      case 'online':
        result = 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
        break;
      case 'offline':
        result = 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
        break;
      case 'maintenance':
        result = 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
        break;
      case 'warning':
        result = 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
        break;
      default:
        result = 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200';
    }

    this.statusClassCache.set(status, result);
    return result;
  }

  // Get notification icon based on type with memoization
  getNotificationIcon(type: string): string {
    if (this.notificationIconCache.has(type)) {
      return this.notificationIconCache.get(type)!;
    }

    let result: string;
    switch (type) {
      case 'message':
        result = 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z';
        break;
      case 'success':
        result = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
        break;
      case 'warning':
        result = 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
        break;
      case 'alert':
        result = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
        break;
      default:
        result = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }

    this.notificationIconCache.set(type, result);
    return result;
  }

  // New method for getting notification icon name for the template
  getNotificationIconName(type: string): string {
    switch (type) {
      case 'message':
        return 'mdi:message';
      case 'success':
        return 'mdi:check-circle';
      case 'warning':
        return 'mdi:bell';
      case 'alert':
        return 'mdi:alert-triangle';
      default:
        return 'mdi:information';
    }
  }

  getNotificationIconBg(type: string): string {
    if (this.notificationIconBgCache.has(type)) {
      return this.notificationIconBgCache.get(type)!;
    }

    let result: string;
    switch (type) {
      case 'message':
        result = 'bg-primary-100 dark:bg-primary-900';
        break;
      case 'success':
        result = 'bg-green-100 dark:bg-green-900';
        break;
      case 'warning':
        result = 'bg-amber-100 dark:bg-amber-900';
        break;
      case 'alert':
        result = 'bg-red-100 dark:bg-red-900';
        break;
      default:
        result = 'bg-neutral-100 dark:bg-neutral-700';
    }

    this.notificationIconBgCache.set(type, result);
    return result;
  }

  getNotificationIconColor(type: string): string {
    if (this.notificationIconColorCache.has(type)) {
      return this.notificationIconColorCache.get(type)!;
    }

    let result: string;
    switch (type) {
      case 'message':
        result = 'text-primary-600 dark:text-primary-400';
        break;
      case 'success':
        result = 'text-green-600 dark:text-green-400';
        break;
      case 'warning':
        result = 'text-amber-600 dark:text-amber-400';
        break;
      case 'alert':
        result = 'text-red-600 dark:text-red-400';
        break;
      default:
        result = 'text-neutral-600 dark:text-neutral-400';
    }

    this.notificationIconColorCache.set(type, result);
    return result;
  }

  // Action handlers - emit events to container component
  handleAction(action: string): void {
    switch (action) {
      case 'createTask':
        this.createTaskAction.emit();
        break;
      case 'scheduleEvent':
        this.scheduleEventAction.emit();
        break;
      case 'reportIssue':
        this.reportIssueAction.emit();
        break;
      case 'runReports':
        this.runReportsAction.emit();
        break;
      case 'addUser':
        this.addUserAction.emit();
        break;
      case 'systemSettings':
        this.systemSettingsAction.emit();
        break;
      case 'facilityManagement':
        this.facilityManagementAction.emit();
        break;
      case 'viewTasks':
        this.viewTasksAction.emit();
        break;
      case 'viewAlerts':
        this.viewAlertsAction.emit();
        break;
      case 'viewMessages':
        this.viewMessagesAction.emit();
        break;
      case 'manageRoles':
        this.manageRolesAction.emit();
        break;
      case 'budgetTracking':
        this.budgetTrackingAction.emit();
        break;
      case 'assignTasks':
        this.assignTasksAction.emit();
        break;
      case 'manageTaskStatus':
        this.manageTaskStatusAction.emit();
        break;
      case 'scheduleTask':
        this.scheduleTaskAction.emit();
        break;
      case 'setTaskPriority':
        this.setTaskPriorityAction.emit();
        break;
      case 'manageUsers':
        this.manageUsersAction.emit();
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }

  // Pre-cache commonly used values for better performance
  private precacheCommonValues(): void {
    // Precache status classes
    ['urgent', 'in-progress', 'pending', 'completed', 'online', 'offline', 'maintenance', 'warning'].forEach(status => {
      this.getStatusClass(status);
    });

    // Precache notification icons
    ['message', 'success', 'warning', 'alert'].forEach(type => {
      this.getNotificationIcon(type);
      this.getNotificationIconBg(type);
      this.getNotificationIconColor(type);
    });
  }

  // Optimize for mobile devices
  private optimizeForMobile(): void {
    this.ngZone.runOutsideAngular(() => {
      // Add passive event listeners to improve scroll performance
      document.addEventListener('touchstart', () => {}, { passive: true });

      // Use Intersection Observer for lazy loading if necessary
      this.setupLazyLoading();
    });
  }

  // Setup lazy loading with Intersection Observer
  private setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // When element is visible, run this code inside Angular zone
            this.ngZone.run(() => {
              const element = entry.target as HTMLElement;
              const sectionType = element.dataset['section'] as SectionType;

              // Load section data if needed
              if (sectionType && this.isSectionActive(sectionType)) {
                // This would be where you load data for a specific section
                // For now we're just using the data passed via inputs
              }
            });

            // Unobserve the element since we only need to load it once
            observer.unobserve(entry.target);
          }
        });
      }, options);

      // Start observing sections after a short delay to prioritize initial render
      setTimeout(() => {
        document.querySelectorAll('[data-section]').forEach(section => {
          observer.observe(section);
        });
      }, 100);
    }
  }
}
