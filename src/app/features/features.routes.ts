import { authGuard } from '../core/guards/auth.guard';
import { HomeContainerComponent } from './home/home-container.component';
import { Routes } from '@angular/router';

// This file contains all feature routes for the application
// Each feature should be a separate lazy-loaded module
export const FEATURES_ROUTES: Routes = [
  { path: '', component: HomeContainerComponent, title: 'Home' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard-container.component').then(
        (c) => c.DashboardContainerComponent,
      ),
    canActivate: [authGuard], // Protect the dashboard route
    title: 'Dashboard',
  },
  {
    path: 'service-requests',
    loadComponent: () =>
      import('./service-requests/service-requests-container.component').then(
        (c) => c.ServiceRequestsContainerComponent,
      ),
    title: 'Service Requests',
  },
  {
    path: 'users-management',
    loadComponent: () =>
      import('./users-management/users-management-container.component').then(
        (c) => c.UsersManagementContainerComponent,
      ),
    canActivate: [authGuard],
    title: 'LNYQE - User Management',
  },
];
