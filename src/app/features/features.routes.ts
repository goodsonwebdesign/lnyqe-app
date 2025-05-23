import { Routes } from '@angular/router';
import { HomeContainerComponent } from './home/home-container.component';
import { authGuard } from '../core/guards/auth.guard';
import { UsersManagementComponent } from './users-management/users-management.component';

// This file contains all feature routes for the application
// Each feature should be a separate lazy-loaded module
export const FEATURES_ROUTES: Routes = [
  { path: '', component: HomeContainerComponent, title: 'Home' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard-container.component').then(m => m.DashboardContainerComponent),
    title: 'Dashboard'
  },
  {
    path: 'service-requests',
    loadComponent: () => import('./service-requests/service-requests-container.component').then(m => m.ServiceRequestsContainerComponent),
    title: 'Service Requests'
  },
  {
    path: 'users-management',
    component: UsersManagementComponent,
    canActivate: [authGuard],
    title: 'LNYQE - User Management'
  }
];
