import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

// This file contains all feature routes for the application
// Each feature should be a separate lazy-loaded module
export const FEATURES_ROUTES: Routes = [
  { path: '', component: HomeComponent, title: 'Home' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard'
  },
  {
    path: 'service-requests',
    loadComponent: () => import('./service-requests/service-requests.component').then(m => m.ServiceRequestsComponent),
    title: 'Service Requests'
  }
];
