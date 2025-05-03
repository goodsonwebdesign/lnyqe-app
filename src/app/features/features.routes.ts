import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

// This file contains all feature routes for the application
// Each feature should be a separate lazy-loaded module
export const FEATURES_ROUTES: Routes = [
  { path: '', component: HomeComponent, title: 'Home' },
  // Add more feature routes here as the application grows
  // Example:
  // {
  //   path: 'dashboard',
  //   loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  //   title: 'Dashboard'
  // },
];
