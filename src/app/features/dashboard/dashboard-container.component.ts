import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { selectCurrentUser } from '../../store/selectors/auth.selectors';
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
  DashboardViewModel
} from './dashboard.types';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent,
    ...UI_COMPONENTS
  ],
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
      (manageGroupsAction)="manageGroups()"
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
      (setTaskPriorityAction)="setTaskPriority()">
    </app-dashboard>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardContainerComponent implements OnInit, OnDestroy {
  // Component state
  user: any = null;
  userRole: string = 'admin'; // Default to admin for now, will be dynamic in the future
  activeSection: SectionType = 'admin';

  // Store access
  private store = inject(Store);
  private subscriptions = new Subscription();

  // Dashboard data
  quickActions: ActionItem[] = [
    {
      iconName: 'mdi:plus',
      label: 'New Task',
      action: 'createTask',
      variant: 'primary'
    },
    {
      iconName: 'mdi:calendar',
      label: 'Schedule',
      action: 'scheduleEvent',
      variant: 'secondary'
    },
    {
      iconName: 'mdi:information',
      label: 'Report Issue',
      action: 'reportIssue',
      variant: 'neutral'
    },
    {
      iconName: 'mdi:file-chart',
      label: 'Reports',
      action: 'runReports',
      variant: 'neutral'
    }
  ];

  // Admin actions only shown to admins in the admin section
  adminActions: ActionItem[] = [
    {
      iconName: 'mdi:account-plus',
      label: 'Add User',
      action: 'addUser',
      variant: 'primary'
    },
    {
      iconName: 'mdi:account-group',
      label: 'Manage Users',
      action: 'manageGroups',
      variant: 'secondary'
    },
    {
      iconName: 'mdi:cog',
      label: 'Settings',
      action: 'systemSettings',
      variant: 'neutral'
    },
    {
      iconName: 'mdi:office-building',
      label: 'Facilities',
      action: 'facilityManagement',
      variant: 'neutral'
    }
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
        isPositive: true
      }
    },
    {
      title: 'Scheduled Events',
      value: '8',
      iconName: 'mdi:calendar',
      iconBg: 'bg-secondary-100 dark:bg-secondary-900',
      iconColor: 'text-secondary-600 dark:text-secondary-400',
      info: 'Next in 3 hours'
    },
    {
      title: 'Maintenance Requests',
      value: '5',
      iconName: 'mdi:flash',
      iconBg: 'bg-amber-100 dark:bg-amber-900',
      iconColor: 'text-amber-600 dark:text-amber-400',
      change: {
        value: '2 Urgent',
        isPositive: false
      }
    },
    {
      title: 'Utilization Rate',
      value: '78%',
      iconName: 'mdi:chart-bar',
      iconBg: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400',
      change: {
        value: '+5% from last month',
        isPositive: true
      }
    }
  ];

  // Tasks data
  tasks: Task[] = [
    {
      title: 'HVAC Maintenance - Building A',
      date: 'Scheduled for May 6, 2025',
      status: 'in-progress',
      iconName: 'mdi:check-circle',
      iconBg: 'bg-primary-100 dark:bg-primary-900',
      iconColor: 'text-primary-600 dark:text-primary-400'
    },
    {
      title: 'Elevator Inspection - Tower 2',
      date: 'Due by May 10, 2025',
      status: 'pending',
      iconName: 'mdi:clock',
      iconBg: 'bg-amber-100 dark:bg-amber-900',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      title: 'Water Leak - Basement Level',
      date: 'Reported 2 hours ago',
      status: 'urgent',
      iconName: 'mdi:alert',
      iconBg: 'bg-red-100 dark:bg-red-900',
      iconColor: 'text-red-600 dark:text-red-400'
    }
  ];

  // Schedule data
  scheduleItems: ScheduleItem[] = [
    {
      title: 'Staff Meeting',
      location: 'Conference Room A',
      time: '9:00 AM',
      duration: '2 hrs',
      attendees: [
        { initials: 'JD', color: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' },
        { initials: 'TM', color: 'bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300' },
        { initials: '+3', color: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300' }
      ]
    },
    {
      title: 'Vendor Meeting',
      location: 'Building B Lobby',
      time: '1:30 PM',
      duration: '1 hr',
      attendees: [
        { initials: 'JD', color: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' }
      ]
    }
  ];

  // Notifications
  notifications: Notification[] = [
    {
      message: 'New comment on maintenance task',
      time: '2 hours ago',
      type: 'message'
    },
    {
      message: 'Task completed: Plumbing repair',
      time: 'Yesterday at 3:45 PM',
      type: 'success'
    },
    {
      message: 'Reminder: Monthly inspection due',
      time: 'Yesterday at 9:00 AM',
      type: 'warning'
    }
  ];

  // System status
  systemStatuses: SystemStatus[] = [
    { name: 'Security System', status: 'online' },
    { name: 'HVAC Controls', status: 'online' },
    { name: 'Water Management', status: 'maintenance' },
    { name: 'Power Backup', status: 'online' }
  ];

  ngOnInit(): void {
    // Get the current authenticated user from the store
    this.subscriptions.add(
      this.store.select(selectCurrentUser).subscribe(user => {
        this.user = user;
        // In a real application, you would set the userRole based on the user data
        // this.userRole = user?.role || 'user';
      })
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
    console.log('Create task action triggered');
  }

  scheduleEvent(): void {
    console.log('Schedule event action triggered');
  }

  reportIssue(): void {
    console.log('Report issue action triggered');
  }

  viewTasks(): void {
    console.log('View tasks action triggered');
  }

  viewAlerts(): void {
    console.log('View alerts action triggered');
  }

  viewMessages(): void {
    console.log('View messages action triggered');
  }

  setView(viewType: string): void {
    console.log(`Set view to ${viewType}`);
  }

  addUser(): void {
    console.log('Add user action triggered');
  }

  manageGroups(): void {
    console.log('Manage groups action triggered');
  }

  manageRoles(): void {
    console.log('Manage roles action triggered');
  }

  runReports(): void {
    console.log('Run reports action triggered');
  }

  systemSettings(): void {
    console.log('System settings action triggered');
  }

  facilityManagement(): void {
    console.log('Facility management action triggered');
  }

  budgetTracking(): void {
    console.log('Budget tracking action triggered');
  }

  assignTasks(): void {
    console.log('Assign tasks action triggered');
  }

  manageTaskStatus(): void {
    console.log('Manage task status action triggered');
  }

  scheduleTask(): void {
    console.log('Schedule task action triggered');
  }

  setTaskPriority(): void {
    console.log('Set task priority action triggered');
  }
}
