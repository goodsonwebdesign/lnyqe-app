import { authGuard } from '../core/guards/auth.guard';
import { HomeContainerComponent } from './home/home-container.component';
import { UsersManagementContainerComponent } from './users-management/users-management-container.component';
import { Routes } from '@angular/router';

// This file contains all feature routes for the application
// Each feature should be a separate lazy-loaded module
export const FEATURES_ROUTES: Routes = [
  { path: '', component: HomeContainerComponent, title: 'Home' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard-container.component').then(
        (m) => m.DashboardContainerComponent,
      ),
    title: 'Dashboard',
  },
  {
    path: 'service-requests',
    loadComponent: () =>
      import('./service-requests/service-requests-container.component').then(
        (m) => m.ServiceRequestsContainerComponent,
      ),
    title: 'Service Requests',
  },
  {
    path: 'users-management',
    component: UsersManagementContainerComponent,
    canActivate: [authGuard],
    title: 'LNYQE - User Management',
  },
];
