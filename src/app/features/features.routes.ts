import { authGuard } from '../core/guards/auth.guard';
import { Routes } from '@angular/router';
import { DashboardContainerComponent } from './dashboard/dashboard-container.component';
import { DashboardWidgetsComponent } from './dashboard/components/dashboard-widgets/dashboard-widgets.component';
import { UsersManagementContainerComponent } from './users-management/users-management-container.component';
import { ServiceRequestsContainerComponent } from './service-requests/service-requests-container.component';

// This file contains all feature routes for the application
// Each feature should be a separate lazy-loaded module
export const FEATURES_ROUTES: Routes = [
  {
    path: '', // The 'dashboard' path is now defined in app.routes.ts
    component: DashboardContainerComponent,
    canActivate: [authGuard], // Protect the dashboard route
    title: 'Dashboard',
    children: [
      {
        path: '',
        component: DashboardWidgetsComponent,
        title: 'Dashboard',
      },
      {
        path: 'users',
        component: UsersManagementContainerComponent,
        canActivate: [authGuard],
        title: 'Manage Users',
      },
      {
        path: 'requests',
        component: ServiceRequestsContainerComponent,
        title: 'Service Requests',
      },
    ],
  },
];
