import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { selectCurrentUser } from '../../store/selectors/auth.selectors';
import { selectUserViewModel } from '../../store/selectors/user.selectors';
import { UserActions } from '../../store/actions/user.actions';
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
      [quickActions]="quickActions"
      [adminActions]="adminActions"
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
  user: any = null;
  userRole: string = 'admin'; // Default to admin for now, will be dynamic in the future
  activeSection: SectionType = 'admin';

  // Store access
  private store = inject(Store);
  private subscriptions = new Subscription();
  private router = inject(Router);

  // Dashboard data
  quickActions: ActionItem[] = [
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

  // Admin actions only shown to admins in the admin section
  adminActions: ActionItem[] = [
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
    // Get the current authenticated user from the store
    this.subscriptions.add(
      this.store.select(selectCurrentUser).subscribe((user) => {
        this.user = user;
      }),
    );

    // Subscribe to user view model to access user state
    this.subscriptions.add(
      this.store.select(selectUserViewModel).subscribe((viewModel) => {
        if (viewModel.error) {
          console.error('Error loading users:', viewModel.error);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
