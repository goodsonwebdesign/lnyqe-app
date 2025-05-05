import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { CardComponent } from '../../shared/components/ui/card/card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { FilterByPipe } from '../../shared/pipes/filter-by.pipe';
import { selectCurrentUser } from '../../store/selectors/auth.selectors';

interface TaskAction {
  icon: string;
  label: string;
  description: string;
  action: () => void;
  size: 'large' | 'small';  // Added size property
  primary?: boolean;       // Optional property for primary actions
}

interface ActionGroup {
  name: string;
  actions: TaskAction[];
}

interface RibbonTab {
  id: string;
  label: string;
  groups: ActionGroup[];
  permission: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, FilterByPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: any = null;
  userRole: string = 'admin'; // Default to admin for now, will be dynamic in the future
  private store = inject(Store);

  // Track active ribbon tab
  activeTabId: string = 'home';
  isRibbonCollapsed: boolean = false;

  // Define ribbon tabs with action groups
  ribbonTabs: RibbonTab[] = [
    {
      id: 'home',
      label: 'Home',
      permission: 'user',
      groups: [
        {
          name: 'New',
          actions: [
            {
              icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
              label: 'Create Task',
              description: 'Create a new task',
              action: () => this.createTask(),
              size: 'large',
              primary: true
            },
            {
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              label: 'Event',
              description: 'Schedule a new event',
              action: () => this.scheduleEvent(),
              size: 'large'
            }
          ]
        },
        {
          name: 'Quick Actions',
          actions: [
            {
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
              label: 'Tasks',
              description: 'View all tasks',
              action: () => this.viewTasks(),
              size: 'small'
            },
            {
              icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
              label: 'Alerts',
              description: 'View alerts',
              action: () => this.viewAlerts(),
              size: 'small'
            },
            {
              icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
              label: 'Messages',
              description: 'View messages',
              action: () => this.viewMessages(),
              size: 'small'
            }
          ]
        },
        {
          name: 'View',
          actions: [
            {
              icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
              label: 'List',
              description: 'List view',
              action: () => this.setView('list'),
              size: 'small'
            },
            {
              icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
              label: 'Cards',
              description: 'Card view',
              action: () => this.setView('cards'),
              size: 'small'
            }
          ]
        }
      ]
    },
    {
      id: 'admin',
      label: 'Administration',
      permission: 'admin',
      groups: [
        {
          name: 'User Management',
          actions: [
            {
              icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
              label: 'Add User',
              description: 'Create a new user account',
              action: () => this.addUser(),
              size: 'large',
              primary: true
            },
            {
              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
              label: 'Groups',
              description: 'Manage user groups',
              action: () => this.manageGroups(),
              size: 'small'
            },
            {
              icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
              label: 'Roles',
              description: 'Manage user roles',
              action: () => this.manageRoles(),
              size: 'small'
            }
          ]
        },
        {
          name: 'System',
          actions: [
            {
              icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
              label: 'Reports',
              description: 'Generate system reports',
              action: () => this.runReports(),
              size: 'large'
            },
            {
              icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
              label: 'Settings',
              description: 'Configure system parameters',
              action: () => this.systemSettings(),
              size: 'small'
            }
          ]
        },
        {
          name: 'Resources',
          actions: [
            {
              icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
              label: 'Facilities',
              description: 'Manage buildings and spaces',
              action: () => this.facilityManagement(),
              size: 'small'
            },
            {
              icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
              label: 'Budget',
              description: 'Monitor expenses and budget',
              action: () => this.budgetTracking(),
              size: 'small'
            }
          ]
        }
      ]
    },
    {
      id: 'tasks',
      label: 'Tasks',
      permission: 'manager',
      groups: [
        {
          name: 'Task Management',
          actions: [
            {
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
              label: 'Assign Tasks',
              description: 'Assign and delegate tasks',
              action: () => this.assignTasks(),
              size: 'large',
              primary: true
            },
            {
              icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
              label: 'Manage Status',
              description: 'Update task statuses',
              action: () => this.manageTaskStatus(),
              size: 'small'
            }
          ]
        },
        {
          name: 'Planning',
          actions: [
            {
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              label: 'Schedule',
              description: 'Task scheduling',
              action: () => this.scheduleTask(),
              size: 'small'
            },
            {
              icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
              label: 'Priority',
              description: 'Set task priorities',
              action: () => this.setTaskPriority(),
              size: 'small'
            }
          ]
        }
      ]
    }
  ];

  ngOnInit(): void {
    // Get the current authenticated user from the store
    this.store.select(selectCurrentUser).subscribe(user => {
      this.user = user;
      // In a real application, you would set the userRole based on the user data
      // this.userRole = user?.role || 'user';
    });
  }

  // Filter tabs based on user permissions
  get filteredRibbonTabs(): RibbonTab[] {
    if (this.userRole === 'admin') {
      return this.ribbonTabs; // Admin can see all tabs
    } else if (this.userRole === 'manager') {
      return this.ribbonTabs.filter(tab =>
        tab.permission === 'manager' || tab.permission === 'user');
    } else {
      return this.ribbonTabs.filter(tab => tab.permission === 'user');
    }
  }

  // Switch between tabs
  setActiveTab(tabId: string): void {
    this.activeTabId = tabId;
  }

  // Toggle ribbon collapse state
  toggleRibbon(): void {
    this.isRibbonCollapsed = !this.isRibbonCollapsed;
  }

  // Action methods
  createTask(): void {
    console.log('Create task action triggered');
  }

  scheduleEvent(): void {
    console.log('Schedule event action triggered');
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
