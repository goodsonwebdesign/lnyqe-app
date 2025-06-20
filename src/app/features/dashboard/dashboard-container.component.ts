import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { selectCurrentUser } from '../../store/selectors/auth.selectors';
import { selectUserViewModel } from '../../store/selectors/user.selectors';
import { UserActions } from '../../store/actions/user.actions';
import { User } from '../../core/models/user.model'; // Ensure User model is imported
import { UI_COMPONENTS } from '../../shared/components/ui';

// Define the component type interfaces
import {
  ActionItem,
  StatCard,
  Task,
  ScheduleItem,
  Notification,
  SystemStatus,
  SectionType,
  DashboardViewModel,
} from './dashboard.types';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [CommonModule, DashboardComponent, ...UI_COMPONENTS],
  template: `
    <app-dashboard
      [user]="user"
      [userRole]="userRole"
      [activeSection]="activeSection"
      [quickActions]="consolidatedQuickActions"
      [statCards]="statCards"
      [tasks]="tasks"
      [scheduleItems]="scheduleItems"
      [notifications]="notifications"
      [systemStatuses]="systemStatuses"
      (sectionChange)="setActiveSection($event)"
      (createTaskAction)="createTask()"
      (scheduleEventAction)="scheduleEvent()"
      (reportIssueAction)="reportIssue()"
      (runReportsAction)="runReports()"
      (addUserAction)="addUser()"
      (systemSettingsAction)="systemSettings()"
      (facilityManagementAction)="facilityManagement()"
      (viewTasksAction)="viewTasks()"
      (viewAlertsAction)="viewAlerts()"
      (viewMessagesAction)="viewMessages()"
      (setViewAction)="setView($event)"
      (manageRolesAction)="manageRoles()"
      (budgetTrackingAction)="budgetTracking()"
      (assignTasksAction)="assignTasks()"
      (manageTaskStatusAction)="manageTaskStatus()"
      (scheduleTaskAction)="scheduleTask()"
      (setTaskPriorityAction)="setTaskPriority()"
      (manageUsersAction)="manageUsers()"
    >
    </app-dashboard>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainerComponent implements OnInit, OnDestroy {
  // Component state
  user: User | null = null; // Typed the user property
  userRole: string = 'guest'; // Initialize with a default non-null string value
  activeSection: SectionType = 'overview'; // Default to 'overview'

  // Store access
  private store = inject(Store);
  private subscriptions = new Subscription();
  private router = inject(Router);

  // Dashboard data
  baseQuickActions: ActionItem[] = [ // Renamed from quickActions to baseQuickActions
    {
      iconName: 'mdi:plus',
      label: 'New Task',
      action: 'createTask',
      variant: 'primary',
    },
    {
      iconName: 'mdi:calendar',
      label: 'Schedule',
      action: 'scheduleEvent',
      variant: 'secondary',
    },
    {
      iconName: 'mdi:information',
      label: 'Report Issue',
      action: 'reportIssue',
      variant: 'neutral',
    },
    {
      iconName: 'mdi:file-chart',
      label: 'Reports',
      action: 'runReports',
      variant: 'neutral',
    },
  ];

  // Admin actions that can be merged into the quick actions ribbon for admins
  adminSpecificQuickActions: ActionItem[] = [
    {
      iconName: 'mdi:account-cog',
      label: 'Manage Users',
      action: 'manageUsers', // This will call the manageUsers method
      variant: 'secondary',
    },
    {
      iconName: 'mdi:cog',
      label: 'System Settings',
      action: 'systemSettings', // This will call the systemSettings method
      variant: 'neutral',
    },
    // Add other admin actions here if they should appear in the ribbon
  ];

  // This will hold the final list of actions for the ribbon
  consolidatedQuickActions: ActionItem[] = [];

  // Original adminActions for other purposes if any (currently unused after ribbon merge)
  allAdminActions: ActionItem[] = [ // Renamed from adminActions to allAdminActions
    {
      iconName: 'mdi:account-plus',
      label: 'Add User',
      action: 'addUser',
      variant: 'primary',
    },
    {
      iconName: 'mdi:account-cog',
      label: 'Manage Users',
      action: 'manageUsers',
      variant: 'secondary',
    },
    {
      iconName: 'mdi:cog',
      label: 'Settings',
      action: 'systemSettings',
      variant: 'neutral',
    },
    {
      iconName: 'mdi:office-building',
      label: 'Facilities',
      action: 'facilityManagement',
      variant: 'neutral',
    },
  ];

  // Stats cards for the overview section
  statCards: StatCard[] = [
    {
      title: 'Open Tasks',
      value: '12',
      iconName: 'mdi:clipboard-check',
      iconBg: 'bg-primary-100 dark:bg-primary-900',
      iconColor: 'text-primary-600 dark:text-primary-400',
      change: {
        value: '+2 Today',
        isPositive: true,
      },
    },
    {
      title: 'Scheduled Events',
      value: '8',
      iconName: 'mdi:calendar',
      iconBg: 'bg-secondary-100 dark:bg-secondary-900',
      iconColor: 'text-secondary-600 dark:text-secondary-400',
      info: 'Next in 3 hours',
    },
    {
      title: 'Maintenance Requests',
      value: '5',
      iconName: 'mdi:flash',
      iconBg: 'bg-amber-100 dark:bg-amber-900',
      iconColor: 'text-amber-600 dark:text-amber-400',
      change: {
        value: '2 Urgent',
        isPositive: false,
      },
    },
    {
      title: 'Utilization Rate',
      value: '78%',
      iconName: 'mdi:chart-bar',
      iconBg: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400',
      change: {
        value: '+5% from last month',
        isPositive: true,
      },
    },
  ];

  // Tasks data
  tasks: Task[] = [
    {
      title: 'HVAC Maintenance - Building A',
      date: 'Scheduled for May 6, 2025',
      status: 'in-progress',
      iconName: 'mdi:check-circle',
      iconBg: 'bg-primary-100 dark:bg-primary-900',
      iconColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      title: 'Elevator Inspection - Tower 2',
      date: 'Due by May 10, 2025',
      status: 'pending',
      iconName: 'mdi:clock',
      iconBg: 'bg-amber-100 dark:bg-amber-900',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Water Leak - Basement Level',
      date: 'Reported 2 hours ago',
      status: 'urgent',
      iconName: 'mdi:alert',
      iconBg: 'bg-red-100 dark:bg-red-900',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  ];

  // Schedule data
  scheduleItems: ScheduleItem[] = [
    {
      title: 'Staff Meeting',
      location: 'Conference Room A',
      time: '9:00 AM',
      duration: '2 hrs',
      attendees: [
        {
          initials: 'JD',
          color: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300',
        },
        {
          initials: 'TM',
          color:
            'bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300',
        },
        {
          initials: '+3',
          color: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300',
        },
      ],
    },
    {
      title: 'Vendor Meeting',
      location: 'Building B Lobby',
      time: '1:30 PM',
      duration: '1 hr',
      attendees: [
        {
          initials: 'JD',
          color: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300',
        },
      ],
    },
  ];

  // Notifications
  notifications: Notification[] = [
    {
      message: 'New comment on maintenance task',
      time: '2 hours ago',
      type: 'message',
    },
    {
      message: 'Task completed: Plumbing repair',
      time: 'Yesterday at 3:45 PM',
      type: 'success',
    },
    {
      message: 'Reminder: Monthly inspection due',
      time: 'Yesterday at 9:00 AM',
      type: 'warning',
    },
  ];

  // System status
  systemStatuses: SystemStatus[] = [
    { name: 'Security System', status: 'online' },
    { name: 'HVAC Controls', status: 'online' },
    { name: 'Water Management', status: 'maintenance' },
    { name: 'Power Backup', status: 'online' },
  ];

  ngOnInit(): void {
    // Log initial activeSection (which is the default 'overview')
    console.log('[DashboardContainer] Initial activeSection in ngOnInit:', this.activeSection);

    // Get the current authenticated user from the store
    this.subscriptions.add(
      this.store.select(selectCurrentUser).subscribe((user) => {
        console.log('[DashboardContainer] User from store:', user);
        this.user = user;
        if (user && user.role) {
          this.userRole = user.role as string;
          console.log('[DashboardContainer] User has role. userRole:', this.userRole);
        } else {
          this.userRole = 'guest';
          console.log('[DashboardContainer] User has no role or is null. userRole:', this.userRole);
        }
        // Always default to 'overview' after user context is established
        this.activeSection = 'overview';
        console.log('[DashboardContainer] Active section set to:', this.activeSection);
        this.buildConsolidatedQuickActions(); // Build the consolidated list
      }),
    );

    // Subscribe to user view model to access user state
    this.subscriptions.add(
      this.store.select(selectUserViewModel).subscribe((viewModel) => {
        if (viewModel.error) {
          console.error('[DashboardContainer] Error from userViewModel:', viewModel.error);
        }
        // console.log('[DashboardContainer] UserViewModel:', viewModel); // Optional: uncomment for more details
      }),
    );

    // Log activeSection at the end of ngOnInit. This shows the value after synchronous setup.
    // The value might change again once the async 'selectCurrentUser' subscription emits.
    console.log('[DashboardContainer] activeSection at end of ngOnInit (before async store updates apply):', this.activeSection);

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private buildConsolidatedQuickActions(): void {
    this.consolidatedQuickActions = [...this.baseQuickActions];
    if (this.userRole === 'admin') {
      this.consolidatedQuickActions.push(...this.adminSpecificQuickActions);
    }
    console.log('[DashboardContainer] Consolidated Quick Actions:', this.consolidatedQuickActions);
  }

  // Methods to handle section changes
  setActiveSection(section: SectionType): void {
    this.activeSection = section;
  }

  // Action methods - business logic handlers
  createTask(): void {
    // Implement task creation logic
    console.log('Create task action triggered');
  }

  scheduleEvent(): void {
    // Implement schedule event logic
    console.log('Schedule event action triggered');
  }

  reportIssue(): void {
    // Implement report issue logic
  }

  viewTasks(): void {
    // Implement view tasks logic
  }

  viewAlerts(): void {
    // Implement view alerts logic
  }

  viewMessages(): void {
    // Implement view messages logic
  }

  setView(viewType: string): void {
    // Implement set view logic
  }

  addUser(): void {
    // Implement add user logic
    console.log('Add user action triggered');
  }

  manageRoles(): void {
    // Implement manage roles logic
    console.log('Manage roles action triggered');
  }

  runReports(): void {
    // Implement run reports logic
  }

  systemSettings(): void {
    // Implement system settings logic
    console.log('System settings action triggered');
  }

  facilityManagement(): void {
    // Implement facility management logic
  }

  budgetTracking(): void {
    // Implement budget tracking logic
  }

  assignTasks(): void {
    // Implement assign tasks logic
  }

  manageTaskStatus(): void {
    // Implement manage task status logic
  }

  scheduleTask(): void {
    // Implement schedule task logic
  }

  setTaskPriority(): void {
    // Implement set task priority logic
  }

  /**
   * Manage users action handler
   * Dispatches the loadUsers action and navigates to users management
   */
  manageUsers(): void {
    // Load users data
    this.store.dispatch(UserActions.loadUsers());
    // Navigate to users management
    this.router.navigate(['/features/users-management']);
  }
}
